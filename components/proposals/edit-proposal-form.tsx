"use client";

import { useState, useTransition } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { updateProposalAction } from "@/app/dashboard/proposals/actions";
import { BudgetBreakdownEditor } from "@/components/proposals/budget-breakdown-editor";
import { BudgetTotalsEditor } from "@/components/proposals/budget-totals-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { computeProposalTotals } from "@/lib/proposal-budget";
import type { Proposal } from "@/types/database";

export function EditProposalForm({ proposal }: { proposal: Proposal }) {
  const [title, setTitle] = useState(proposal.title);
  const [clientName, setClientName] = useState(proposal.client_name ?? "");
  const [clientEmail, setClientEmail] = useState(proposal.client_email ?? "");
  const [introMessage, setIntroMessage] = useState(proposal.intro_message ?? "");
  const [scopeItems, setScopeItems] = useState(proposal.scope_items);
  const [discountAmount, setDiscountAmount] = useState(proposal.discount_amount);
  const [taxPercentage, setTaxPercentage] = useState(proposal.tax_percentage);
  const [currency, setCurrency] = useState(proposal.currency);
  const [validUntil, setValidUntil] = useState(proposal.valid_until ?? "");
  const [isPending, startTransition] = useTransition();

  const readOnly = proposal.status !== "draft";
  const totals = computeProposalTotals(scopeItems, discountAmount, taxPercentage);

  function handleSave() {
    startTransition(async () => {
      const result = await updateProposalAction(proposal.id, {
        title,
        clientName,
        clientEmail,
        introMessage,
        scopeItems,
        discountAmount,
        taxPercentage,
        currency,
        validUntil,
        briefId: proposal.brief_id,
        submissionId: proposal.submission_id,
      });
      if (result.error) toast.error(result.error);
      else toast.success("Propuesta guardada");
    });
  }

  return (
    <div className="space-y-5">
      {readOnly && (
        <p className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          Esta propuesta ya fue enviada y no se puede editar. Crea una nueva si
          necesitas cambiar el alcance o el precio.
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={readOnly}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="clientName">Nombre del cliente</Label>
          <Input
            id="clientName"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            disabled={readOnly}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="clientEmail">Correo del cliente</Label>
          <Input
            id="clientEmail"
            type="email"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            disabled={readOnly}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="introMessage">Mensaje introductorio</Label>
        <Textarea
          id="introMessage"
          rows={3}
          value={introMessage}
          onChange={(e) => setIntroMessage(e.target.value)}
          disabled={readOnly}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="currency">Moneda</Label>
          <Input
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            disabled={readOnly}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="validUntil">Válida hasta</Label>
          <Input
            id="validUntil"
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
            disabled={readOnly}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Presupuesto</Label>
        {readOnly ? (
          <ul className="space-y-2 rounded-lg border border-border p-3.5">
            {scopeItems.map((item, i) => (
              <li key={i} className="flex justify-between text-sm">
                <div>
                  <span className="font-medium">{item.label}</span>
                  {item.description && (
                    <span className="text-muted-foreground"> — {item.description}</span>
                  )}
                </div>
                {item.unitPrice != null && (
                  <span className="shrink-0 font-medium">
                    {currency} {((item.quantity ?? 1) * item.unitPrice).toLocaleString()}
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <BudgetBreakdownEditor items={scopeItems} onChange={setScopeItems} currency={currency} />
        )}
      </div>

      {readOnly ? (
        <div className="rounded-lg border border-border p-4 text-sm">
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>
              {currency} {(proposal.price ?? 0).toLocaleString()}
            </span>
          </div>
        </div>
      ) : (
        <BudgetTotalsEditor
          items={scopeItems}
          discountAmount={discountAmount}
          onDiscountChange={setDiscountAmount}
          taxPercentage={taxPercentage}
          onTaxChange={setTaxPercentage}
          currency={currency}
        />
      )}

      {!readOnly && (
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Guardar cambios ({currency} {totals.total.toLocaleString()})
        </Button>
      )}
    </div>
  );
}
