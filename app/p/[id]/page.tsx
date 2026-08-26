import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProposalSigningView } from "@/components/public/proposal-signing-view";
import { createClient } from "@/lib/supabase/server";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getProposal(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("proposal_public")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const proposal = await getProposal(id);
  return { title: proposal ? proposal.title : "Propuesta no disponible" };
}

export default async function PublicProposalPage({ params }: PageProps) {
  const { id } = await params;
  const proposal = await getProposal(id);

  if (!proposal) notFound();

  return <ProposalSigningView proposal={proposal} />;
}
