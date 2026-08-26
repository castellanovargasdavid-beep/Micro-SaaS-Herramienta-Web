import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";

import { ProposalPdfDocument } from "@/components/pdf/proposal-pdf-document";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Una propuesta ya firmada es un comprobante que ambas partes deben poder
 * descargar, así que se permite sin sesión cuando status === 'accepted'.
 * Mientras esté en borrador o enviada, solo el dueño autenticado puede verla.
 * Se usa la service_role key para leer porque un visitante anónimo no tiene
 * policy de SELECT sobre la tabla base (solo sobre la vista proposal_public);
 * la autorización para el caso no-accepted se aplica aquí mismo, en código.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: proposal, error } = await admin
    .from("proposals")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !proposal) {
    return NextResponse.json({ error: "Propuesta no encontrada." }, { status: 404 });
  }

  if (proposal.status !== "accepted") {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || user.id !== proposal.user_id) {
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    }
  }

  const buffer = await renderToBuffer(<ProposalPdfDocument proposal={proposal} />);

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="propuesta-${id}.pdf"`,
    },
  });
}
