import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";

import { BriefPdfDocument } from "@/components/pdf/brief-pdf-document";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const { data: submission, error } = await supabase
    .from("submissions")
    .select("client_name, ai_summary, briefs!inner(title, user_id)")
    .eq("id", id)
    .single();

  if (error || !submission || !submission.ai_summary) {
    return NextResponse.json(
      { error: "Resumen no encontrado o aún no generado." },
      { status: 404 },
    );
  }

  const buffer = await renderToBuffer(
    <BriefPdfDocument
      briefTitle={submission.briefs.title}
      clientName={submission.client_name}
      summary={submission.ai_summary}
    />,
  );

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="brief-${id}.pdf"`,
    },
  });
}
