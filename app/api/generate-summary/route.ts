import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { z } from "zod";

import { generateBriefSummary, summaryToMarkdown } from "@/lib/anthropic";
import { createClient } from "@/lib/supabase/server";

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
    const summary = await generateBriefSummary(
      brief.title,
      brief.questions,
      submission.answers,
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
