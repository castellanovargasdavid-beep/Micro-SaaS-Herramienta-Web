"use server";

import { headers } from "next/headers";
import { z } from "zod";

import { createAdminClient } from "@/lib/supabase/admin";

const signSchema = z.object({
  proposalId: z.string().uuid(),
  signerName: z.string().min(2, "Ingresa tu nombre completo"),
  signatureData: z.string().min(100, "Falta la firma"),
});

export interface SignProposalState {
  status: "idle" | "success" | "error";
  error?: string;
}

export async function signProposalAction(
  proposalId: string,
  signerName: string,
  signatureData: string,
): Promise<SignProposalState> {
  const parsed = signSchema.safeParse({ proposalId, signerName, signatureData });
  if (!parsed.success) {
    return { status: "error", error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  // Firma electrónica simple (no certificada): se valida y escribe con la
  // service_role key porque no hay sesión — un visitante anónimo no tiene
  // permiso de UPDATE directo sobre proposals (ver RLS en supabase/schema.sql).
  const admin = createAdminClient();

  const { data: proposal } = await admin
    .from("proposals")
    .select("id, status")
    .eq("id", parsed.data.proposalId)
    .single();

  if (!proposal || proposal.status !== "sent") {
    return {
      status: "error",
      error: "Esta propuesta ya no está disponible para firmar.",
    };
  }

  const headersList = await headers();
  const signerIp =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  const { error } = await admin
    .from("proposals")
    .update({
      status: "accepted",
      signer_name: parsed.data.signerName,
      signature_data: parsed.data.signatureData,
      signed_at: new Date().toISOString(),
      signer_ip: signerIp,
    })
    .eq("id", parsed.data.proposalId)
    .eq("status", "sent");

  if (error) {
    return { status: "error", error: "No se pudo registrar la firma. Intenta de nuevo." };
  }

  return { status: "success" };
}
