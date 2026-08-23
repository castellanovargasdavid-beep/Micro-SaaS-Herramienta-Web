import Anthropic from "@anthropic-ai/sdk";

import type { AiSummary, BriefQuestion } from "@/types/database";

let _anthropic: Anthropic | null = null;

/**
 * Instancia perezosa: si se creara a nivel de módulo, Next.js la
 * inicializaría al importar las rutas API durante `next build`, y el SDK de
 * Anthropic lanza una excepción cuando ANTHROPIC_API_KEY no está definido —
 * eso rompía el build en plataformas donde las env vars aún no están
 * configuradas. Al crearla dentro de una función, solo se instancia cuando
 * una request real la necesita (runtime, no build time).
 */
function getAnthropicClient(): Anthropic {
  if (!_anthropic) {
    _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  }
  return _anthropic;
}

export const CLAUDE_MODEL = "claude-opus-5";

const SUMMARY_SYSTEM_PROMPT = `Eres un director de proyectos senior en una agencia creativa. Tu trabajo es
transformar respuestas caóticas o informales de un cliente en un brief ejecutivo, claro y accionable
para que un freelancer o equipo creativo pueda empezar a trabajar de inmediato.

Reglas:
- Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin markdown, sin backticks.
- Si el cliente no proporcionó información suficiente para un campo, infiere de forma razonable a partir
  del contexto o indica "No especificado" — nunca inventes datos concretos (fechas, precios) que no
  fueron mencionados.
- Sé conciso y orientado a la acción: cada entregable debe ser una tarea concreta.
- Escribe en español neutro, tono profesional pero directo.

El JSON debe tener exactamente esta forma:
{
  "objective": string,
  "deliverables": string[],
  "tone": string,
  "deadline": string | null,
  "assets_needed": string[],
  "target_audience": string,
  "budget_notes": string,
  "key_risks": string[],
  "executive_summary": string
}`;

function buildUserPrompt(
  briefTitle: string,
  questions: BriefQuestion[],
  answers: Record<string, string>,
): string {
  const qa = questions
    .map((q) => {
      const answer = answers[q.id]?.trim();
      return `- ${q.label}\n  Respuesta: ${answer && answer.length > 0 ? answer : "(sin responder)"}`;
    })
    .join("\n");

  return `Brief: "${briefTitle}"

Respuestas del cliente:
${qa}

Genera el resumen ejecutivo estructurado en el formato JSON indicado.`;
}

export async function generateBriefSummary(
  briefTitle: string,
  questions: BriefQuestion[],
  answers: Record<string, string>,
): Promise<AiSummary> {
  const message = await getAnthropicClient().messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1500,
    system: SUMMARY_SYSTEM_PROMPT,
    messages: [
      { role: "user", content: buildUserPrompt(briefTitle, questions, answers) },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude no devolvió contenido de texto.");
  }

  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No se pudo extraer JSON de la respuesta de Claude.");
  }

  return JSON.parse(jsonMatch[0]) as AiSummary;
}

export function summaryToMarkdown(
  briefTitle: string,
  clientName: string | null,
  summary: AiSummary,
): string {
  return `# Brief ejecutivo — ${briefTitle}

${clientName ? `**Cliente:** ${clientName}\n` : ""}
## Resumen ejecutivo
${summary.executive_summary}

## Objetivo
${summary.objective}

## Entregables
${summary.deliverables.map((d) => `- ${d}`).join("\n")}

## Tono / Voz de marca
${summary.tone}

## Audiencia objetivo
${summary.target_audience ?? "No especificado"}

## Assets necesarios
${summary.assets_needed.map((a) => `- ${a}`).join("\n")}

## Deadline
${summary.deadline ?? "No especificado"}

## Notas de presupuesto
${summary.budget_notes ?? "No especificado"}

${
  summary.key_risks && summary.key_risks.length > 0
    ? `## Riesgos / puntos de atención\n${summary.key_risks.map((r) => `- ${r}`).join("\n")}\n`
    : ""
}
---
_Generado con BriefFast_
`;
}
