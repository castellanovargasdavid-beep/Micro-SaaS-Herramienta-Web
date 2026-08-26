"use server";

import { z } from "zod";

import {
  generateBriefSummary,
  summaryToMarkdown,
  type PdfAttachmentInput,
} from "@/lib/anthropic";
import { transcribeAudio } from "@/lib/openai";
import { createAdminClient } from "@/lib/supabase/admin";
import { ATTACHMENTS_BUCKET } from "@/lib/supabase/storage";
import { createClient } from "@/lib/supabase/server";
import type { AttachmentKind, BriefQuestion } from "@/types/database";

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

  return { status: "success" };
}
