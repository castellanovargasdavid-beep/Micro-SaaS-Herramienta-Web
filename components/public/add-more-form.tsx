"use client";

import { useState } from "react";
import { CheckCircle2, Clock, Loader2, SendHorizontal } from "lucide-react";

import { addFollowUpAction } from "@/app/b/[id]/actions";
import {
  AttachmentsStep,
  type PendingAttachment,
} from "@/components/public/attachments-step";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  briefId: string;
  briefTitle: string;
  submissionId: string;
  clientFirstName: string | null;
  deadline: string;
}

export function AddMoreForm({
  briefId,
  briefTitle,
  submissionId,
  clientFirstName,
  deadline,
}: Props) {
  const [notes, setNotes] = useState("");
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    if (!notes.trim() && attachments.length === 0) {
      setError("Escribe algo o adjunta al menos un archivo.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const result = await addFollowUpAction({
      submissionId,
      briefId,
      additionalNotes: notes.trim() || undefined,
      attachments,
    });
    setSubmitting(false);

    if (result.status === "success") {
      setDone(true);
    } else {
      setError(result.error ?? "Ocurrió un error. Intenta de nuevo.");
    }
  }

  if (done) {
    return (
      <div className="mx-auto flex min-h-svh w-full max-w-lg flex-col items-center justify-center px-4 py-12 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="size-7" />
        </div>
        <h1 className="mt-4 text-xl font-semibold">
          ¡Listo{clientFirstName ? `, ${clientFirstName}` : ""}!
        </h1>
        <p className="mt-2 text-muted-foreground">
          Agregamos tu información a la respuesta que ya habías enviado.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-lg flex-col px-4 py-8 sm:py-12">
      <h1 className="text-2xl font-bold tracking-tight text-balance">
        {briefTitle}
      </h1>
      <p className="mt-3 text-muted-foreground">
        Ya recibimos tu respuesta{clientFirstName ? `, ${clientFirstName}` : ""}.
        Si se te olvidó algo o quieres cambiar algún detalle, puedes agregarlo
        aquí abajo.
      </p>
      <p className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
        <Clock className="size-3.5" />
        Puedes agregar información hasta el {deadline}
      </p>

      <div className="mt-6 space-y-1.5">
        <Label htmlFor="follow-up-notes">¿Qué quieres agregar o cambiar?</Label>
        <Textarea
          id="follow-up-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ej: Se me olvidó mencionar que también necesito..."
          rows={5}
          autoFocus
        />
      </div>

      <div className="mt-5">
        <AttachmentsStep value={attachments} onChange={setAttachments} />
      </div>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      <Button
        type="button"
        variant="gradient"
        className="mt-6"
        onClick={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <SendHorizontal className="size-4" />
        )}
        Enviar información adicional
      </Button>
    </div>
  );
}
