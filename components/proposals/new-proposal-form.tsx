"use client";

import { useActionState, useState } from "react";
import { Loader2, Send } from "lucide-react";

import {
  createProposalAction,
  type ProposalActionState,
} from "@/app/dashboard/proposals/actions";
import { ScopeItemsEditor } from "@/components/proposals/scope-items-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ProposalScopeItem } from "@/types/database";

const initialState: ProposalActionState = {};

export function NewProposalForm({
  briefId,
  submissionId,
  initialTitle,
  initialClientName,
  initialClientEmail,
  initialScopeItems,
}: {
  briefId: string | null;
  submissionId: string | null;
  initialTitle: string;
  initialClientName: string;
  initialClientEmail: string;
  initialScopeItems: ProposalScopeItem[];
}) {
  const [scopeItems, setScopeItems] = useState<ProposalScopeItem[]>(initialScopeItems);
  const [state, formAction, pending] = useActionState(createProposalAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="briefId" value={briefId ?? ""} />
      <input type="hidden" name="submissionId" value={submissionId ?? ""} />
      <input type="hidden" name="scopeItems" value={JSON.stringify(scopeItems)} />

      <div className="space-y-1.5">
        <Label htmlFor="title">Título de la propuesta</Label>
        <Input id="title" name="title" defaultValue={initialTitle} required />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="clientName">Nombre del cliente</Label>
          <Input id="clientName" name="clientName" defaultValue={initialClientName} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="clientEmail">Correo del cliente</Label>
          <Input
            id="clientEmail"
            name="clientEmail"
            type="email"
            defaultValue={initialClientEmail}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="introMessage">Mensaje introductorio (opcional)</Label>
        <Textarea
          id="introMessage"
          name="introMessage"
          rows={3}
          placeholder="Gracias por la info, aquí tienes la propuesta para tu proyecto..."
        />
      </div>

      <div className="space-y-1.5">
        <Label>Alcance del proyecto</Label>
        <ScopeItemsEditor items={scopeItems} onChange={setScopeItems} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="price">Precio</Label>
          <Input id="price" name="price" type="number" min="0" step="0.01" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="currency">Moneda</Label>
          <Input id="currency" name="currency" defaultValue="USD" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="validUntil">Válida hasta</Label>
          <Input id="validUntil" name="validUntil" type="date" />
        </div>
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" variant="gradient" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        Crear propuesta
      </Button>
    </form>
  );
}
