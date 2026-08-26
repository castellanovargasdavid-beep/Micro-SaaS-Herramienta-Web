import type { Metadata } from "next";

import { NewProposalForm } from "@/components/proposals/new-proposal-form";
import { requireUser } from "@/lib/data/dashboard";
import type { ProposalScopeItem } from "@/types/database";

export const metadata: Metadata = { title: "Nueva propuesta" };

interface PageProps {
  searchParams: Promise<{ submissionId?: string; briefId?: string }>;
}

export default async function NewProposalPage({ searchParams }: PageProps) {
  const { supabase, user } = await requireUser();
  const { submissionId, briefId } = await searchParams;

  let initialTitle = "";
  let initialClientName = "";
  let initialClientEmail = "";
  let initialScopeItems: ProposalScopeItem[] = [{ label: "", description: "" }];

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
      if (submission.ai_summary?.deliverables?.length) {
        initialScopeItems = submission.ai_summary.deliverables.map((d) => ({
          label: d,
          description: "",
        }));
      }
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight">Nueva propuesta</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Define el alcance y el precio. Podrás enviarla y hacer que el cliente
        la firme desde un enlace público.
      </p>

      <div className="mt-6">
        <NewProposalForm
          briefId={briefId ?? null}
          submissionId={submissionId ?? null}
          initialTitle={initialTitle}
          initialClientName={initialClientName}
          initialClientEmail={initialClientEmail}
          initialScopeItems={initialScopeItems}
        />
      </div>
    </div>
  );
}
