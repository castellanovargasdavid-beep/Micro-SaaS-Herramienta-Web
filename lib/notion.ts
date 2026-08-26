import { Client, isFullPage } from "@notionhq/client";
import type {
  BlockObjectRequest,
  CreatePageParameters,
} from "@notionhq/client/build/src/api-endpoints";

import type { AiSummary } from "@/types/database";

function heading(text: string): BlockObjectRequest {
  return {
    object: "block",
    type: "heading_3",
    heading_3: { rich_text: [{ type: "text", text: { content: text } }] },
  };
}

function paragraph(text: string): BlockObjectRequest {
  return {
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: [{ type: "text", text: { content: text.slice(0, 1990) } }],
    },
  };
}

function bulletedList(items: string[]): BlockObjectRequest[] {
  return items.map((item) => ({
    object: "block",
    type: "bulleted_list_item",
    bulleted_list_item: {
      rich_text: [{ type: "text", text: { content: item.slice(0, 1990) } }],
    },
  }));
}

function buildSummaryBlocks(
  clientName: string | null,
  summary: AiSummary,
): BlockObjectRequest[] {
  return [
    ...(clientName ? [paragraph(`Cliente: ${clientName}`)] : []),
    heading("Resumen ejecutivo"),
    paragraph(summary.executive_summary),
    heading("Objetivo"),
    paragraph(summary.objective),
    heading("Entregables"),
    ...bulletedList(summary.deliverables),
    heading("Tono / voz de marca"),
    paragraph(summary.tone),
    heading("Audiencia objetivo"),
    paragraph(summary.target_audience ?? "No especificado"),
    heading("Assets necesarios"),
    ...bulletedList(summary.assets_needed),
    heading("Deadline"),
    paragraph(summary.deadline ?? "No especificado"),
    heading("Notas de presupuesto"),
    paragraph(summary.budget_notes ?? "No especificado"),
    ...(summary.key_risks && summary.key_risks.length > 0
      ? [heading("Riesgos / puntos de atención"), ...bulletedList(summary.key_risks)]
      : []),
  ];
}

/**
 * Exporta el resumen de un brief a una base de datos de Notion del propio
 * usuario. Usa una "internal integration" (token estático, sin OAuth) —
 * el usuario lo crea en notion.so/my-integrations y lo pega en Configuración.
 * Nota: la base de datos destino debe compartirse con esa integración desde
 * Notion (botón "Connections" en la base de datos) o la llamada fallará con
 * "object_not_found", aunque el token y el ID sean correctos.
 */
export async function exportBriefSummaryToNotion(params: {
  notionToken: string;
  databaseId: string;
  briefTitle: string;
  clientName: string | null;
  summary: AiSummary;
}): Promise<string> {
  const notion = new Client({ auth: params.notionToken });

  const database = await notion.databases.retrieve({
    database_id: params.databaseId,
  });

  const titlePropertyName = Object.entries(database.properties).find(
    ([, prop]) => prop.type === "title",
  )?.[0];

  if (!titlePropertyName) {
    throw new Error(
      "La base de datos de Notion no tiene una propiedad de tipo 'Título'.",
    );
  }

  const createParams: CreatePageParameters = {
    parent: { database_id: params.databaseId },
    properties: {
      [titlePropertyName]: {
        title: [{ type: "text", text: { content: params.briefTitle } }],
      },
    },
    children: buildSummaryBlocks(params.clientName, params.summary),
  };

  const page = await notion.pages.create(createParams);

  return isFullPage(page) ? page.url : `https://notion.so/${page.id.replace(/-/g, "")}`;
}
