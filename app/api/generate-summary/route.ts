import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  generateBriefSummary,
  summaryToMarkdown,
  type PdfAttachmentInput,
} from "@/lib/anthropic";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { ATTACHMENTS_BUCKET } from "@/lib/supabase/storage";

const bodySchema = z.object({
  submissionId: z.string().uuid(),
});

/**
 * Endpoint seguro para (re)generar el resumen ejecutivo de una respuesta
 * con Claude. Requiere sesión activa y que el usuario sea dueño del brief
 * al que pertenece la submission (verificado vía RLS + join explícito).
 */
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "submissionId inválido." },
      { status: 400 },
    );
  }

  const { data: submission, error: fetchError } = await supabase
    .from("submissions")
    .select("id, answers, client_name, briefs!inner(id, title, questions, user_id)")
    .eq("id", parsed.data.submissionId)
    .single();

  if (fetchError || !submission) {
    return NextResponse.json(
      { error: "Respuesta no encontrada o sin permisos." },
      { status: 404 },
    );
  }

  const brief = submission.briefs;

  try {
    const { data: attachments } = await supabase
      .from("submission_attachments")
      .select("kind, storage_path, original_filename, transcript")
      .eq("submission_id", submission.id);

    const voiceTranscripts = (attachments ?? [])
      .filter((a) => a.kind === "audio" && a.transcript)
      .map((a) => a.transcript!);

    const pdfAttachments = (attachments ?? []).filter((a) => a.kind === "pdf");
    const pdfDocuments: PdfAttachmentInput[] = [];
    if (pdfAttachments.length > 0) {
      const admin = createAdminClient();
      for (const pdf of pdfAttachments) {
        const { data: blob } = await admin.storage
          .from(ATTACHMENTS_BUCKET)
          .download(pdf.storage_path);
        if (!blob) continue;
        pdfDocuments.push({
          filename: pdf.original_filename ?? "documento.pdf",
          base64: Buffer.from(await blob.arrayBuffer()).toString("base64"),
        });
      }
    }

    const summary = await generateBriefSummary(
      brief.title,
      brief.questions,
      submission.answers,
      { voiceTranscripts, pdfDocuments },
    );
    const markdown = summaryToMarkdown(
      brief.title,
      submission.client_name,
      summary,
    );

    const { error: updateError } = await supabase
      .from("submissions")
      .update({
        ai_summary: summary,
        ai_summary_markdown: markdown,
        status: "processed",
        processed_at: new Date().toISOString(),
      })
      .eq("id", submission.id);

    if (updateError) {
      return NextResponse.json(
        { error: "No se pudo guardar el resumen generado." },
        { status: 500 },
      );
    }

    return NextResponse.json({ summary, markdown });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "Límite de la API de IA alcanzado. Intenta en unos minutos." },
        { status: 429 },
      );
    }
    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "Clave de la API de IA inválida (configuración del servidor)." },
        { status: 500 },
      );
    }
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `Error de la API de IA: ${err.message}` },
        { status: 502 },
      );
    }

    console.error("[generate-summary] error inesperado:", err);
    return NextResponse.json(
      { error: "No se pudo generar el resumen. Intenta de nuevo." },
      { status: 500 },
    );
  }
}
