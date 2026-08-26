import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Download } from "lucide-react";

import { CopyLinkButton } from "@/components/dashboard/copy-link-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteProposalButton } from "@/components/proposals/delete-proposal-button";
import { EditProposalForm } from "@/components/proposals/edit-proposal-form";
import { SendProposalButton } from "@/components/proposals/send-proposal-button";
import { APP_URL } from "@/lib/constants";
import { requireUser } from "@/lib/data/dashboard";
import type { ProposalStatus } from "@/types/database";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Detalle de propuesta" };

const STATUS_LABEL: Record<ProposalStatus, string> = {
  draft: "Borrador",
  sent: "Enviada — esperando firma",
  accepted: "Firmada",
  declined: "Rechazada",
};

export default async function ProposalDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { supabase, user } = await requireUser();

  const { data: proposal } = await supabase
    .from("proposals")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!proposal) notFound();

  const publicUrl = `${APP_URL}/p/${proposal.id}`;

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/dashboard/proposals"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Propuestas
      </Link>

      <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{proposal.title}</h1>
            <Badge variant={proposal.status === "accepted" ? "success" : "secondary"}>
              {STATUS_LABEL[proposal.status]}
            </Badge>
          </div>
          {proposal.status !== "draft" && (
            <div className="mt-2 flex items-center gap-2">
              <code className="truncate rounded-md bg-muted px-2 py-1 text-xs">
                {publicUrl}
              </code>
              <CopyLinkButton url={publicUrl} />
            </div>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          {proposal.status === "draft" && <SendProposalButton proposalId={proposal.id} />}
          {proposal.status === "accepted" && (
            <Button variant="outline" size="sm" asChild>
              <a href={`/api/proposals/${proposal.id}/export-pdf`} target="_blank" rel="noreferrer">
                <Download className="size-3.5" />
                Descargar PDF firmado
              </a>
            </Button>
          )}
        </div>
      </div>

      {proposal.status === "accepted" && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-success/30 bg-success/5 p-4">
          <CheckCircle2 className="size-5 shrink-0 text-success" />
          <p className="text-sm">
            Firmada por <strong>{proposal.signer_name}</strong> el{" "}
            {proposal.signed_at &&
              new Date(proposal.signed_at).toLocaleDateString("es", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            .
          </p>
        </div>
      )}

      <div className="mt-6">
        <EditProposalForm proposal={proposal} />
      </div>

      {proposal.status === "draft" && (
        <div className="mt-8 rounded-xl border border-destructive/30 bg-destructive/5 p-5">
          <h3 className="text-sm font-semibold text-destructive">Zona de peligro</h3>
          <div className="mt-3">
            <DeleteProposalButton proposalId={proposal.id} />
          </div>
        </div>
      )}
    </div>
  );
}
