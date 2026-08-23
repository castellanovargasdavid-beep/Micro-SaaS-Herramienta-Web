"use server";

import { z } from "zod";

import { generateBriefSummary, summaryToMarkdown } from "@/lib/anthropic";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { BriefQuestion } from "@/types/database";

const submissionSchema = z.object({
  briefId: z.string().uuid(),
  clientName: z.string().min(1, "Ingresa tu nombre"),
  clientEmail: z.string().email("Ingresa un correo válido"),
  answers: z.record(z.string(), z.string()),
});

export interface SubmitBriefState {
  status: "idle" | "success" | "error";
  error?: string;
}

export async function submitBriefAction(
  briefId: string,
  briefTitle: string,
  questions: BriefQuestion[],
  input: {
    clientName: string;
    clientEmail: string;
    answers: Record<string, string>;
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

  // Generación automática del resumen IA. Si falla (p.ej. clave inválida),
  // la respuesta queda igual como "pending" y puede reprocesarse desde el
  // dashboard sin que el cliente final note ningún error.
  try {
    const summary = await generateBriefSummary(
      briefTitle,
      questions,
      parsed.data.answers,
    );
    const markdown = summaryToMarkdown(
      briefTitle,
      parsed.data.clientName,
      summary,
    );

    // El anon key no tiene permiso de UPDATE sobre submissions (por diseño,
    // ver RLS en supabase/schema.sql); se usa la service_role key aquí.
    const admin = createAdminClient();
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
