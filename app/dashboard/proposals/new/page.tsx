import type { Metadata } from "next";

import { NewProposalForm } from "@/components/proposals/new-proposal-form";
import { suggestProposalBudget } from "@/lib/anthropic";
import { requireUser } from "@/lib/data/dashboard";
import type { ProposalScopeItem } from "@/types/database";

export const metadata: Metadata = { title: "Nueva propuesta" };

interface PageProps {
  searchParams: Promise<{ submissionId?: string; briefId?: string }>;
}

export default async function NewProposalPage({ searchParams }: PageProps) {
  const { supabase, user, profile } = await requireUser();
  const { submissionId, briefId } = await searchParams;

  let initialTitle = "";
  let initialClientName = "";
  let initialClientEmail = "";
  let initialScopeItems: ProposalScopeItem[] = [
    { label: "", description: "", pricingType: "fixed", quantity: 1, unitPrice: 0 },
  ];

  if (submissionId) {
    const { data: submission } = await supabase
      .from("submissions")
      .select("client_name, client_email, ai_summary, briefs!inner(title, user_id)")
      .eq("id", submissionId)
      .single();

    if (submission && submission.briefs.user_id === user.id) {
      initialClientName = submission.client_name ?? "";
      initialClientEmail = submission.client_email ?? "";
      initialTitle = `Propuesta — ${submission.briefs.title}`;

      const deliverables = submission.ai_summary?.deliverables ?? [];
      if (deliverables.length > 0) {
        const { data: rateCardItems } = await supabase
          .from("rate_card_items")
          .select("*")
          .eq("user_id", user.id)
          .order("sort_order", { ascending: true });

        try {
          const suggested = await suggestProposalBudget(
            deliverables,
            rateCardItems ?? [],
            profile.default_currency,
          );
          if (suggested.length > 0) {
            initialScopeItems = suggested.map((item) => ({
              label: item.label,
              description: "",
              pricingType: item.pricingType ?? "fixed",
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              needsReview: item.needsReview,
              matchedRateItemId: item.matchedRateItemId,
            }));
          } else {
            initialScopeItems = deliverables.map((d) => ({
              label: d,
              description: "",
              pricingType: "fixed",
              quantity: 1,
              unitPrice: 0,
              needsReview: true,
            }));
          }
        } catch (err) {
          console.error("[NewProposalPage] fallo el presupuesto sugerido:", err);
          initialScopeItems = deliverables.map((d) => ({
            label: d,
            description: "",
            pricingType: "fixed",
            quantity: 1,
            unitPrice: 0,
            needsReview: true,
          }));
        }
      }
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight">Nueva propuesta</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {submissionId
          ? "La IA ya cruzó los entregables con tu catálogo de tarifas. Revisa el presupuesto y ajústalo antes de enviarlo."
          : "Define el alcance y el precio. Podrás enviarla y hacer que el cliente la firme desde un enlace público."}
      </p>

      <div className="mt-6">
        <NewProposalForm
          briefId={briefId ?? null}
          submissionId={submissionId ?? null}
          initialTitle={initialTitle}
          initialClientName={initialClientName}
          initialClientEmail={initialClientEmail}
          initialScopeItems={initialScopeItems}
          defaultCurrency={profile.default_currency}
          defaultTaxPercentage={profile.tax_percentage}
        />
      </div>
    </div>
  );
}
