"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { computeProposalTotals } from "@/lib/proposal-budget";
import { createClient } from "@/lib/supabase/server";
import type { ProposalScopeItem } from "@/types/database";

const scopeItemSchema = z.object({
  label: z.string().min(1),
  description: z.string().optional().default(""),
  pricingType: z.enum(["fixed", "hourly", "monthly"]).optional(),
  quantity: z.coerce.number().min(0).optional(),
  unitPrice: z.coerce.number().min(0).optional(),
  needsReview: z.boolean().optional(),
  matchedRateItemId: z.string().nullable().optional(),
});

const proposalInputSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  clientName: z.string().optional(),
  clientEmail: z.string().email().optional().or(z.literal("")),
  introMessage: z.string().optional(),
  scopeItems: z.array(scopeItemSchema).min(1, "Agrega al menos un alcance"),
  discountAmount: z.coerce.number().min(0).default(0),
  taxPercentage: z.coerce.number().min(0).max(100).default(0),
  currency: z.string().default("USD"),
  validUntil: z.string().optional(),
  briefId: z.string().uuid().optional().nullable(),
  submissionId: z.string().uuid().optional().nullable(),
});

export interface ProposalActionState {
  error?: string;
}

export async function createProposalAction(
  _prevState: ProposalActionState,
  formData: FormData,
): Promise<ProposalActionState> {
  const parsed = proposalInputSchema.safeParse({
    title: formData.get("title"),
    clientName: formData.get("clientName"),
    clientEmail: formData.get("clientEmail"),
    introMessage: formData.get("introMessage"),
    scopeItems: JSON.parse((formData.get("scopeItems") as string) || "[]"),
    discountAmount: formData.get("discountAmount") || 0,
    taxPercentage: formData.get("taxPercentage") || 0,
    currency: formData.get("currency") || "USD",
    validUntil: formData.get("validUntil") || undefined,
    briefId: formData.get("briefId") || null,
    submissionId: formData.get("submissionId") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const scopeItems = parsed.data.scopeItems as ProposalScopeItem[];
  const totals = computeProposalTotals(
    scopeItems,
    parsed.data.discountAmount,
    parsed.data.taxPercentage,
  );

  const { data: proposal, error } = await supabase
    .from("proposals")
    .insert({
      user_id: user.id,
      title: parsed.data.title,
      client_name: parsed.data.clientName || null,
      client_email: parsed.data.clientEmail || null,
      intro_message: parsed.data.introMessage || null,
      scope_items: scopeItems,
      subtotal: totals.subtotal,
      discount_amount: parsed.data.discountAmount,
      tax_percentage: parsed.data.taxPercentage,
      price: totals.total,
      currency: parsed.data.currency,
      valid_until: parsed.data.validUntil || null,
      brief_id: parsed.data.briefId,
      submission_id: parsed.data.submissionId,
      status: "draft",
    })
    .select("id")
    .single();

  if (error || !proposal) {
    return { error: "No se pudo crear la propuesta. Intenta de nuevo." };
  }

  revalidatePath("/dashboard/proposals");
  redirect(`/dashboard/proposals/${proposal.id}`);
}

export async function updateProposalAction(
  proposalId: string,
  input: z.infer<typeof proposalInputSchema>,
): Promise<ProposalActionState> {
  const parsed = proposalInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const scopeItems = parsed.data.scopeItems as ProposalScopeItem[];
  const totals = computeProposalTotals(
    scopeItems,
    parsed.data.discountAmount,
    parsed.data.taxPercentage,
  );

  const supabase = await createClient();
  const { error } = await supabase
    .from("proposals")
    .update({
      title: parsed.data.title,
      client_name: parsed.data.clientName || null,
      client_email: parsed.data.clientEmail || null,
      intro_message: parsed.data.introMessage || null,
      scope_items: scopeItems,
      subtotal: totals.subtotal,
      discount_amount: parsed.data.discountAmount,
      tax_percentage: parsed.data.taxPercentage,
      price: totals.total,
      currency: parsed.data.currency,
      valid_until: parsed.data.validUntil || null,
    })
    .eq("id", proposalId);

  if (error) return { error: "No se pudo guardar. Intenta de nuevo." };

  revalidatePath(`/dashboard/proposals/${proposalId}`);
  return {};
}

export async function sendProposalAction(proposalId: string) {
  const supabase = await createClient();
  await supabase
    .from("proposals")
    .update({ status: "sent" })
    .eq("id", proposalId)
    .eq("status", "draft");
  revalidatePath(`/dashboard/proposals/${proposalId}`);
  revalidatePath("/dashboard/proposals");
}

export async function deleteProposalAction(proposalId: string) {
  const supabase = await createClient();
  await supabase.from("proposals").delete().eq("id", proposalId);
  revalidatePath("/dashboard/proposals");
  redirect("/dashboard/proposals");
}
