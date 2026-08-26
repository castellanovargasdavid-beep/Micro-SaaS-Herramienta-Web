import { NextResponse } from "next/server";

import { exportBriefSummaryToNotion } from "@/lib/notion";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("notion_token, notion_database_id")
    .eq("id", user.id)
    .single();

  if (!profile?.notion_token || !profile.notion_database_id) {
    return NextResponse.json(
      { error: "Configura tu integración de Notion en Configuración primero." },
      { status: 400 },
    );
  }

  const { data: submission, error } = await supabase
    .from("submissions")
    .select("client_name, ai_summary, briefs!inner(title, user_id)")
    .eq("id", id)
    .single();

  if (error || !submission || !submission.ai_summary) {
    return NextResponse.json(
      { error: "Aún no hay un resumen generado para exportar." },
      { status: 404 },
    );
  }

  try {
    const url = await exportBriefSummaryToNotion({
      notionToken: profile.notion_token,
      databaseId: profile.notion_database_id,
      briefTitle: submission.briefs.title,
      clientName: submission.client_name,
      summary: submission.ai_summary,
    });
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[export-notion] error:", err);
    const message =
      err instanceof Error
        ? err.message
        : "No se pudo exportar a Notion. Revisa el token y el Database ID.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
