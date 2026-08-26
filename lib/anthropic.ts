import Anthropic from "@anthropic-ai/sdk";

import type {
  AiSummary,
  BriefQuestion,
  ProposalScopeItem,
  RateCardItem,
} from "@/types/database";

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
transformar requerimientos caóticos o informales de un cliente —texto, notas de voz transcritas y
documentos adjuntos— en un brief ejecutivo, claro y accionable para que un freelancer o equipo creativo
pueda empezar a trabajar de inmediato.

Reglas:
- Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin markdown, sin backticks.
- Usa TODA la información disponible: respuestas de texto, transcripciones de notas de voz y el
  contenido de documentos PDF adjuntos (briefs previos, cotizaciones, referencias) cuentan igual que
  las respuestas del formulario.
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
  voiceTranscripts: string[],
): string {
  const qa = questions
    .map((q) => {
      const answer = answers[q.id]?.trim();
      return `- ${q.label}\n  Respuesta: ${answer && answer.length > 0 ? answer : "(sin responder)"}`;
    })
    .join("\n");

  const voiceSection =
    voiceTranscripts.length > 0
      ? `\n\nNotas de voz del cliente (transcritas automáticamente):\n${voiceTranscripts
          .map((t, i) => `[Nota de voz ${i + 1}]: ${t}`)
          .join("\n")}`
      : "";

  return `Brief: "${briefTitle}"

Respuestas del cliente:
${qa}${voiceSection}

Genera el resumen ejecutivo estructurado en el formato JSON indicado. Si hay documentos PDF adjuntos a este mensaje, incorpora su contenido relevante.`;
}

export interface PdfAttachmentInput {
  filename: string;
  base64: string;
}

export async function generateBriefSummary(
  briefTitle: string,
  questions: BriefQuestion[],
  answers: Record<string, string>,
  options: {
    voiceTranscripts?: string[];
    pdfDocuments?: PdfAttachmentInput[];
  } = {},
): Promise<AiSummary> {
  const voiceTranscripts = options.voiceTranscripts ?? [];
  const pdfDocuments = options.pdfDocuments ?? [];

  const content: Anthropic.MessageParam["content"] = [
    ...pdfDocuments.map(
      (doc): Anthropic.DocumentBlockParam => ({
        type: "document",
        source: {
          type: "base64",
          media_type: "application/pdf",
          data: doc.base64,
        },
        title: doc.filename,
      }),
    ),
    {
      type: "text",
      text: buildUserPrompt(briefTitle, questions, answers, voiceTranscripts),
    },
  ];

  const message = await getAnthropicClient().messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    system: SUMMARY_SYSTEM_PROMPT,
    messages: [{ role: "user", content }],
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

const REFINE_SYSTEM_PROMPT = `Eres un asistente que ayuda a extraer requerimientos profundos de clientes en un
formulario de brief creativo. Tu única tarea es decidir si la respuesta de un cliente a una pregunta es
demasiado vaga o genérica para que un freelancer pueda trabajar con ella (ej: "algo moderno", "lo que tú
creas mejor", "no sé, sorpréndeme"), y si lo es, generar UNA pregunta de seguimiento corta y concreta que
ayude a precisarla.

Responde ÚNICAMENTE con un objeto JSON de esta forma, sin texto adicional:
{ "isVague": boolean, "followUpQuestion": string | null }

Reglas:
- Solo marca isVague=true si la respuesta realmente no le da nada accionable a un freelancer.
- Una respuesta corta pero específica (ej: "azul y blanco", "3 días") NO es vaga.
- followUpQuestion debe ser una sola pregunta concreta en español, natural, como la haría un diseñador
  o consultor humano (ej: "¿Cuando dices 'moderno', piensas en algo minimalista tipo Apple, o más bold
  y colorido?"). Null si isVague es false.`;

export interface RefineAnswerResult {
  isVague: boolean;
  followUpQuestion: string | null;
}

export async function refineAnswerIfVague(
  questionLabel: string,
  answer: string,
): Promise<RefineAnswerResult> {
  const message = await getAnthropicClient().messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 300,
    system: REFINE_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Pregunta del formulario: "${questionLabel}"\nRespuesta del cliente: "${answer}"`,
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    return { isVague: false, followUpQuestion: null };
  }

  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return { isVague: false, followUpQuestion: null };

  try {
    return JSON.parse(jsonMatch[0]) as RefineAnswerResult;
  } catch {
    return { isVague: false, followUpQuestion: null };
  }
}

const BUDGET_SYSTEM_PROMPT = `Eres un asistente que arma presupuestos para freelancers y agencias
boutique. Se te da una lista de entregables detectados en el brief de un cliente y el catálogo de
tarifas propio del freelancer (sus precios reales, no inventes tarifas de mercado). Tu trabajo es cruzar
cada entregable con el ítem del catálogo que mejor corresponda.

Reglas:
- Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin markdown, sin backticks.
- Si un entregable corresponde claramente a un ítem del catálogo, usa exactamente su "id", su
  pricing_type y su amount como unitPrice. needsReview debe ser false.
- Si es de tipo "hourly", estima horas razonables ("quantity") según la complejidad descrita del
  entregable — nunca inventes un precio distinto al amount por hora del catálogo.
- Si NO hay ningún ítem del catálogo que corresponda razonablemente, deja matchedRateItemId en null,
  sugiere pricingType "fixed", una cantidad de 1, un unitPrice estimado prudente en la moneda indicada
  (nunca $0), y marca needsReview como true — el freelancer lo revisará antes de enviar.
- No agregues entregables que el cliente no pidió. No fusiones varios entregables en una sola línea
  salvo que ya vinieran así en la lista.

El JSON debe tener exactamente esta forma:
{ "items": [
  { "label": string, "matchedRateItemId": string | null, "pricingType": "fixed" | "hourly" | "monthly",
    "quantity": number, "unitPrice": number, "needsReview": boolean }
] }`;

export interface SuggestedBudgetItem {
  label: string;
  matchedRateItemId: string | null;
  pricingType: ProposalScopeItem["pricingType"];
  quantity: number;
  unitPrice: number;
  needsReview: boolean;
}

/**
 * Cruza los entregables de un brief con el catálogo de tarifas del usuario
 * para armar un presupuesto sugerido. Si el usuario no tiene catálogo
 * (rateCardItems vacío), todas las líneas quedan marcadas needsReview=true
 * con un precio estimado prudente, para que el freelancer las complete.
 */
export async function suggestProposalBudget(
  deliverables: string[],
  rateCardItems: RateCardItem[],
  currency: string,
): Promise<SuggestedBudgetItem[]> {
  if (deliverables.length === 0) return [];

  const catalog =
    rateCardItems.length > 0
      ? rateCardItems
          .map(
            (item) =>
              `- id: ${item.id} — "${item.name}" (${item.pricing_type}, ${item.amount} ${currency})`,
          )
          .join("\n")
      : "(el freelancer todavía no tiene un catálogo de tarifas configurado)";

  const message = await getAnthropicClient().messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1500,
    system: BUDGET_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Moneda: ${currency}

Catálogo de tarifas del freelancer:
${catalog}

Entregables detectados en el brief:
${deliverables.map((d) => `- ${d}`).join("\n")}`,
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") return [];

  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return [];

  try {
    const parsed = JSON.parse(jsonMatch[0]) as { items: SuggestedBudgetItem[] };
    return parsed.items ?? [];
  } catch {
    return [];
  }
}
