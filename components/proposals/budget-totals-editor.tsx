"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { computeProposalTotals } from "@/lib/proposal-budget";
import type { ProposalScopeItem } from "@/types/database";

export function BudgetTotalsEditor({
  items,
  discountAmount,
  onDiscountChange,
  taxPercentage,
  onTaxChange,
  currency,
}: {
  items: ProposalScopeItem[];
  discountAmount: number;
  onDiscountChange: (value: number) => void;
  taxPercentage: number;
  onTaxChange: (value: number) => void;
  currency: string;
}) {
  const totals = computeProposalTotals(items, discountAmount, taxPercentage);

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="discountAmount">Descuento ({currency})</Label>
          <Input
            id="discountAmount"
            type="number"
            min="0"
            step="0.01"
            value={discountAmount || ""}
            onChange={(e) => onDiscountChange(Number(e.target.value) || 0)}
            placeholder="0"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="taxPercentage">Impuesto (%)</Label>
          <Input
            id="taxPercentage"
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={taxPercentage || ""}
            onChange={(e) => onTaxChange(Number(e.target.value) || 0)}
            placeholder="0"
          />
        </div>
      </div>

      <div className="mt-4 space-y-1.5 border-t border-border pt-3 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span>
            {currency} {totals.subtotal.toLocaleString()}
          </span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-muted-foreground">
            <span>Descuento</span>
            <span>
              -{currency} {discountAmount.toLocaleString()}
            </span>
          </div>
        )}
        {taxPercentage > 0 && (
          <div className="flex justify-between text-muted-foreground">
            <span>Impuesto ({taxPercentage}%)</span>
            <span>
              {currency} {totals.taxAmount.toLocaleString()}
            </span>
          </div>
        )}
        <div className="flex justify-between border-t border-border pt-1.5 text-base font-bold">
          <span>Total</span>
          <span>
            {currency} {totals.total.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
