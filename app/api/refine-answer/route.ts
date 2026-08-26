import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { z } from "zod";

import { refineAnswerIfVague } from "@/lib/anthropic";

const bodySchema = z.object({
  questionLabel: z.string().min(1).max(300),
  answer: z.string().min(1).max(2000),
});

/**
 * Endpoint público (sin sesión): lo llama el formulario /b/[id] mientras el
 * cliente final responde, para decidir si vale la pena repreguntar en el
 * momento. Los límites de longitud en el schema acotan el costo por request
 * ya que no requiere autenticación.
 */
export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ isVague: false, followUpQuestion: null });
  }

  try {
    const result = await refineAnswerIfVague(
      parsed.data.questionLabel,
      parsed.data.answer,
    );
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      console.error("[refine-answer] error de la API de IA:", err.message);
    } else {
      console.error("[refine-answer] error inesperado:", err);
    }
    // Ante cualquier falla, dejamos avanzar al cliente sin repregunta.
    return NextResponse.json({ isVague: false, followUpQuestion: null });
  }
}
