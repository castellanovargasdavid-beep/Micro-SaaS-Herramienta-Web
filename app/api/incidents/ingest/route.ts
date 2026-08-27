import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { generateIncidentBrief } from "@/lib/anthropic";
import {
  AUDIO_EXTENSIONS,
  isAllowedAudioFile,
  MAX_AUDIO_SIZE_BYTES,
} from "@/lib/incidents";
import { transcribeAudio } from "@/lib/openai";
import { createClient } from "@/lib/supabase/server";

/**
 * Ingesta del chatbot de incidencias: recibe texto pegado de un chat o un
 * archivo de audio, transcribe si aplica, y devuelve el brief estructurado
 * por Claude. No persiste nada — el guardado ocurre cuando el usuario
 * confirma/edita el brief (ver app/dashboard/incidents/actions.ts).
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const text = formData.get("text");
  const audio = formData.get("audio");

  const hasText = typeof text === "string" && text.trim().length > 0;
  const hasAudio = audio instanceof File && audio.size > 0;

  if (!hasText && !hasAudio) {
    return NextResponse.json(
      { error: "Pega un mensaje de texto o adjunta una nota de audio." },
      { status: 400 },
    );
  }

  let rawText: string;
  let source: "text" | "audio";

  try {
    if (hasAudio) {
      const file = audio as File;
      if (!isAllowedAudioFile(file)) {
        return NextResponse.json(
          {
            error: `Formato de audio no soportado. Usa ${AUDIO_EXTENSIONS.join(", ")}.`,
          },
          { status: 400 },
        );
      }
      if (file.size > MAX_AUDIO_SIZE_BYTES) {
        return NextResponse.json(
          { error: "El audio supera el tamaño máximo permitido (25 MB)." },
          { status: 400 },
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      rawText = await transcribeAudio(buffer, file.name);
      source = "audio";

      if (!rawText) {
        return NextResponse.json(
          { error: "No se pudo transcribir el audio. Intenta con otro archivo." },
          { status: 422 },
        );
      }
    } else {
      rawText = (text as string).trim();
      source = "text";
    }

    const brief = await generateIncidentBrief(rawText);

    return NextResponse.json({ rawText, source, brief });
  } catch (err) {
    if (err instanceof ZodError) {
      console.error("[incidents/ingest] JSON de Claude no cumple el schema:", err.issues);
      return NextResponse.json(
        { error: "La IA no devolvió un brief con el formato esperado. Intenta de nuevo." },
        { status: 502 },
      );
    }
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

    console.error("[incidents/ingest] error inesperado:", err);
    return NextResponse.json(
      { error: "No se pudo procesar la incidencia. Intenta de nuevo." },
      { status: 500 },
    );
  }
}
