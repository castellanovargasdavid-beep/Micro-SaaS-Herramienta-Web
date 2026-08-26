"use client";

import { useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  Download,
  FileSignature,
  Loader2,
  Sparkles,
} from "lucide-react";

import { signProposalAction } from "@/app/p/[id]/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignaturePad } from "@/components/public/signature-pad";
import type { ProposalPublic } from "@/types/database";

export function ProposalSigningView({ proposal }: { proposal: ProposalPublic }) {
  const [status, setStatus] = useState(proposal.status);
  const [signerName, setSignerName] = useState(proposal.signer_name ?? "");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSign() {
    if (!nameDraft.trim()) {
      setError("Ingresa tu nombre completo.");
      return;
    }
    if (!signatureData) {
      setError("Dibuja tu firma antes de continuar.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const result = await signProposalAction(proposal.id, nameDraft.trim(), signatureData);
    setSubmitting(false);

    if (result.status === "success") {
      setSignerName(nameDraft.trim());
      setStatus("accepted");
      setDialogOpen(false);
    } else {
      setError(result.error ?? "Ocurrió un error. Intenta de nuevo.");
    }
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-lg flex-col px-4 py-10 sm:py-16">
      <div className="flex items-center gap-2 text-primary">
        <Sparkles className="size-5" />
        <span className="text-sm font-semibold">Propuesta comercial</span>
      </div>

      <h1 className="mt-3 text-2xl font-bold tracking-tight text-balance">
        {proposal.title}
      </h1>
      {proposal.client_name && (
        <p className="mt-1 text-sm text-muted-foreground">Para: {proposal.client_name}</p>
      )}

      {proposal.intro_message && (
        <p className="mt-4 text-muted-foreground">{proposal.intro_message}</p>
      )}

      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">Alcance del proyecto</h2>
        <ul className="mt-3 space-y-3">
          {proposal.scope_items.map((item, i) => (
            <li key={i} className="text-sm">
              <p className="font-medium">{item.label}</p>
              {item.description && (
                <p className="text-muted-foreground">{item.description}</p>
              )}
            </li>
          ))}
        </ul>

        {proposal.price != null && (
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm font-medium">Precio total</span>
            <span className="text-lg font-bold">
              {proposal.currency} {proposal.price.toLocaleString()}
            </span>
          </div>
        )}

        {proposal.valid_until && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarClock className="size-3.5" />
            Válida hasta {new Date(proposal.valid_until).toLocaleDateString("es")}
          </p>
        )}
      </div>

      {status === "accepted" ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-xl border border-success/30 bg-success/5 p-5 text-center">
          <CheckCircle2 className="size-8 text-success" />
          <p className="text-sm">
            Propuesta aceptada y firmada por <strong>{signerName}</strong>.
          </p>
          <Button variant="outline" size="sm" asChild>
            <a href={`/api/proposals/${proposal.id}/export-pdf`} target="_blank" rel="noreferrer">
              <Download className="size-3.5" />
              Descargar copia en PDF
            </a>
          </Button>
        </div>
      ) : (
        <Button
          size="lg"
          variant="gradient"
          className="mt-6"
          onClick={() => setDialogOpen(true)}
        >
          <FileSignature className="size-4" />
          Revisar y firmar
        </Button>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Firmar propuesta</DialogTitle>
            <DialogDescription>
              Al firmar aceptas el alcance y precio descritos arriba.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="signerName">Tu nombre completo</Label>
              <Input
                id="signerName"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                placeholder="Nombre y apellido"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tu firma</Label>
              <SignaturePad onChange={setSignatureData} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              className="w-full"
              variant="gradient"
              onClick={handleSign}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <FileSignature className="size-4" />
              )}
              Confirmar firma
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
