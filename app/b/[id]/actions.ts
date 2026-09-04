"use server";

import { cookies } from "next/headers";
import { z } from "zod";

import {
  generateBriefSummary,
  summaryToMarkdown,
  type PdfAttachmentInput,
} from "@/lib/anthropic";
import { EXTRA_NOTES_ANSWER_KEY } from "@/lib/constants";
import { transcribeAudio } from "@/lib/openai";
import {
  sendNewSubmissionEmail,
  sendSubmissionConfirmationEmail,
} from "@/lib/resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { ATTACHMENTS_BUCKET } from "@/lib/supabase/storage";
import { createClient } from "@/lib/supabase/server";
import type { AttachmentKind, BriefQuestion } from "@/types/database";

// Cookie que identifica, en el propio navegador del cliente, cuál fue su
// última respuesta a este brief — así, si vuelve al mismo enlace dentro de
// la ventana de edición, se le ofrece agregar información en vez de
// pedirle que rellene todo el formulario otra vez. No es un dato sensible
// (solo un id de submission), pero la ventana de tiempo real siempre se
// vuelve a verificar en el servidor antes de aceptar cualquier cambio.
function submissionCookieName(briefId: string) {
  return `bq_sub_${briefId}`;
}

const attachmentSchema = z.object({
  kind: z.enum(["audio", "pdf", "image", "file"]),
  storagePath: z.string().min(1),
  originalFilename: z.string().nullable().optional(),
});

const submissionSchema = z.object({
  briefId: z.string().uuid(),
  clientName: z.string().min(1, "Ingresa tu nombre"),
  clientEmail: z.string().email("Ingresa un correo válido"),
  answers: z.record(z.string(), z.string()),
  attachments: z.array(attachmentSchema).max(10),
});

export interface SubmitBriefState {
  status: "idle" | "success" | "error";
  error?: string;
}

export interface PendingAttachment {
  kind: AttachmentKind;
  storagePath: string;
  originalFilename: string | null;
}

export async function submitBriefAction(
  briefId: string,
  briefTitle: string,
  questions: BriefQuestion[],
  input: {
    clientName: string;
    clientEmail: string;
    answers: Record<string, string>;
    attachments: PendingAttachment[];
  },
): Promise<SubmitBriefState> {
  const parsed = submissionSchema.safeParse({ briefId, ...input });

  if (!parsed.success) {
    return {
      status: "error",
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const missingRequired = questions.find(
    (q) => q.required && !parsed.data.answers[q.id]?.trim(),
  );
  if (missingRequired) {
    return {
      status: "error",
      error: `Falta responder: "${missingRequired.label}"`,
    };
  }

  // Se usa el cliente con cookies (anon key); la policy submissions_public_insert
  // permite insertar sin sesión siempre que el brief esté publicado.
  const supabase = await createClient();

  const { data: submission, error } = await supabase
    .from("submissions")
    .insert({
      brief_id: parsed.data.briefId,
      client_name: parsed.data.clientName,
      client_email: parsed.data.clientEmail,
      answers: parsed.data.answers,
    })
    .select("id")
    .single();

  if (error || !submission) {
    return {
      status: "error",
      error: "No se pudo enviar el formulario. Intenta de nuevo.",
    };
  }

  if (parsed.data.attachments.length > 0) {
    await supabase.from("submission_attachments").insert(
      parsed.data.attachments.map((a) => ({
        submission_id: submission.id,
        kind: a.kind,
        storage_path: a.storagePath,
        original_filename: a.originalFilename ?? null,
      })),
    );
  }

  // Generación automática del resumen IA. Si falla (p.ej. clave inválida),
  // la respuesta queda igual como "pending" y puede reprocesarse desde el
  // dashboard sin que el cliente final note ningún error.
  try {
    // El anon key no tiene permiso de UPDATE ni de leer el bucket privado
    // (por diseño, ver RLS en supabase/schema.sql); se usa la service_role
    // key para transcribir audio, leer PDFs y guardar el resumen.
    const admin = createAdminClient();

    const voiceTranscripts: string[] = [];
    const pdfDocuments: PdfAttachmentInput[] = [];

    for (const attachment of parsed.data.attachments) {
      if (attachment.kind !== "audio" && attachment.kind !== "pdf") continue;

      const { data: blob, error: downloadError } = await admin.storage
        .from(ATTACHMENTS_BUCKET)
        .download(attachment.storagePath);
      if (downloadError || !blob) continue;

      const buffer = Buffer.from(await blob.arrayBuffer());

      if (attachment.kind === "audio") {
        try {
          const transcript = await transcribeAudio(
            buffer,
            attachment.originalFilename ?? "nota-de-voz.webm",
          );
          voiceTranscripts.push(transcript);
          await admin
            .from("submission_attachments")
            .update({ transcript, transcribed_at: new Date().toISOString() })
            .eq("submission_id", submission.id)
            .eq("storage_path", attachment.storagePath);
        } catch (transcribeErr) {
          console.error("[submitBriefAction] fallo la transcripción:", transcribeErr);
        }
      } else {
        pdfDocuments.push({
          filename: attachment.originalFilename ?? "documento.pdf",
          base64: buffer.toString("base64"),
        });
      }
    }

    const summary = await generateBriefSummary(
      briefTitle,
      questions,
      parsed.data.answers,
      { voiceTranscripts, pdfDocuments },
    );
    const markdown = summaryToMarkdown(
      briefTitle,
      parsed.data.clientName,
      summary,
    );

    await admin
      .from("submissions")
      .update({
        ai_summary: summary,
        ai_summary_markdown: markdown,
        status: "processed",
        processed_at: new Date().toISOString(),
      })
      .eq("id", submission.id);
  } catch (err) {
    console.error("[submitBriefAction] fallo la generación de IA:", err);
  }

  // Aviso al freelancer (a su correo de cuenta, normalmente su Gmail) + email
  // de confirmación al cliente. Cada envío va en su propio try/catch: si uno
  // falla (p.ej. RESEND_API_KEY sin configurar) no debe impedir el otro, y
  // ninguno de los dos debe bloquear el envío del formulario del cliente.
  try {
    const admin = createAdminClient();
    const { data: brief } = await admin
      .from("briefs")
      .select("user_id")
      .eq("id", briefId)
      .maybeSingle();

    if (brief) {
      const { data: owner } = await admin
        .from("profiles")
        .select("email")
        .eq("id", brief.user_id)
        .maybeSingle();

      if (owner) {
        await sendNewSubmissionEmail({
          to: owner.email,
          briefId,
          briefTitle,
          submissionId: submission.id,
          clientName: parsed.data.clientName,
        });
      }
    }
  } catch (err) {
    console.error("[submitBriefAction] fallo el email al freelancer:", err);
  }

  try {
    await sendSubmissionConfirmationEmail({
      to: parsed.data.clientEmail,
      clientName: parsed.data.clientName,
      briefTitle,
    });
  } catch (err) {
    console.error("[submitBriefAction] fallo el email de confirmación:", err);
  }

  (await cookies()).set(submissionCookieName(briefId), submission.id, {
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    sameSite: "lax",
  });

  return { status: "success" };
}

const followUpSchema = z.object({
  submissionId: z.string().uuid(),
  briefId: z.string().uuid(),
  additionalNotes: z.string().max(4000).optional(),
  attachments: z.array(attachmentSchema).max(10).optional(),
});

export interface FollowUpState {
  status: "idle" | "success" | "error";
  error?: string;
}

/**
 * Deja que el mismo cliente agregue texto y/o archivos a una respuesta que
 * ya envió, dentro de la ventana de horas que definió el dueño del brief.
 * La cookie solo sirve para que el navegador del cliente "recuerde" cuál es
 * su submission — la autorización real es recalcular aquí, en el servidor,
 * si sigue dentro de la ventana de tiempo antes de aceptar el cambio.
 */
export async function addFollowUpAction(
  input: z.infer<typeof followUpSchema>,
): Promise<FollowUpState> {
  const parsed = followUpSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", error: "Datos inválidos." };
  }
  if (!parsed.data.additionalNotes?.trim() && !parsed.data.attachments?.length) {
    return { status: "error", error: "Agrega texto o al menos un archivo." };
  }

  const admin = createAdminClient();

  const { data: brief } = await admin
    .from("briefs")
    .select("id, title, questions, edit_window_hours")
    .eq("id", parsed.data.briefId)
    .maybeSingle();
  if (!brief) return { status: "error", error: "Este brief ya no existe." };

  const { data: submission } = await admin
    .from("submissions")
    .select("id, brief_id, answers, created_at")
    .eq("id", parsed.data.submissionId)
    .eq("brief_id", parsed.data.briefId)
    .maybeSingle();
  if (!submission) {
    return { status: "error", error: "No se encontró tu respuesta original." };
  }

  const deadlineMs =
    new Date(submission.created_at).getTime() +
    brief.edit_window_hours * 60 * 60 * 1000;
  if (brief.edit_window_hours <= 0 || Date.now() > deadlineMs) {
    return {
      status: "error",
      error: "El plazo para agregar información a esta respuesta ya venció.",
    };
  }

  const newAttachments = parsed.data.attachments ?? [];
  if (newAttachments.length > 0) {
    await admin.from("submission_attachments").insert(
      newAttachments.map((a) => ({
        submission_id: submission.id,
        kind: a.kind,
        storage_path: a.storagePath,
        original_filename: a.originalFilename ?? null,
      })),
    );
  }

  const additionalNotes = parsed.data.additionalNotes?.trim();
  const previousNotes = submission.answers[EXTRA_NOTES_ANSWER_KEY]?.trim();
  const mergedAnswers = additionalNotes
    ? {
        ...submission.answers,
        [EXTRA_NOTES_ANSWER_KEY]: previousNotes
          ? `${previousNotes}\n\n[Agregado después] ${additionalNotes}`
          : `[Agregado después] ${additionalNotes}`,
      }
    : submission.answers;

  await admin
    .from("submissions")
    .update({ answers: mergedAnswers })
    .eq("id", submission.id);

  // Se re-arma el resumen con IA desde cero, incluyendo TODOS los adjuntos
  // (los de antes y los nuevos), para que el brief siga siendo un solo
  // resumen limpio y no dos versiones sueltas que el freelancer tenga que
  // comparar a mano.
  try {
    const { data: allAttachments } = await admin
      .from("submission_attachments")
      .select("kind, storage_path, original_filename, transcript")
      .eq("submission_id", submission.id);

    const voiceTranscripts: string[] = [];
    const pdfDocuments: PdfAttachmentInput[] = [];

    for (const attachment of allAttachments ?? []) {
      if (attachment.transcript) {
        voiceTranscripts.push(attachment.transcript);
        continue;
      }
      if (attachment.kind !== "audio" && attachment.kind !== "pdf") continue;

      const { data: blob } = await admin.storage
        .from(ATTACHMENTS_BUCKET)
        .download(attachment.storage_path);
      if (!blob) continue;
      const buffer = Buffer.from(await blob.arrayBuffer());

      if (attachment.kind === "audio") {
        try {
          const transcript = await transcribeAudio(
            buffer,
            attachment.original_filename ?? "nota-de-voz.webm",
          );
          voiceTranscripts.push(transcript);
          await admin
            .from("submission_attachments")
            .update({ transcript, transcribed_at: new Date().toISOString() })
            .eq("submission_id", submission.id)
            .eq("storage_path", attachment.storage_path);
        } catch (transcribeErr) {
          console.error("[addFollowUpAction] fallo la transcripción:", transcribeErr);
        }
      } else {
        pdfDocuments.push({
          filename: attachment.original_filename ?? "documento.pdf",
          base64: buffer.toString("base64"),
        });
      }
    }

    const summary = await generateBriefSummary(
      brief.title,
      brief.questions,
      mergedAnswers,
      { voiceTranscripts, pdfDocuments },
    );
    const markdown = summaryToMarkdown(brief.title, null, summary);

    await admin
      .from("submissions")
      .update({
        ai_summary: summary,
        ai_summary_markdown: markdown,
        processed_at: new Date().toISOString(),
      })
      .eq("id", submission.id);
  } catch (err) {
    console.error("[addFollowUpAction] fallo la generación de IA:", err);
  }

  return { status: "success" };
}
