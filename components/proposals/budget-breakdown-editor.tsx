"use client";

import { AlertTriangle, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { computeItemSubtotal } from "@/lib/proposal-budget";
import type { ProposalScopeItem, RatePricingType } from "@/types/database";

const PRICING_TYPE_LABELS: Record<RatePricingType, string> = {
  fixed: "Fijo",
  hourly: "Por hora",
  monthly: "Por mes",
};

function newItem(): ProposalScopeItem {
  return {
    label: "",
    description: "",
    pricingType: "fixed",
    quantity: 1,
    unitPrice: 0,
    needsReview: false,
  };
}

export function BudgetBreakdownEditor({
  items,
  onChange,
  currency,
}: {
  items: ProposalScopeItem[];
  onChange: (items: ProposalScopeItem[]) => void;
  currency: string;
}) {
  function update(index: number, patch: Partial<ProposalScopeItem>) {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const isHourly = item.pricingType === "hourly";
        const subtotal = computeItemSubtotal(item);
        return (
          <div key={index} className="rounded-lg border border-border p-3.5">
            <div className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    value={item.label}
                    onChange={(e) => update(index, { label: e.target.value })}
                    placeholder="Ej: Diseño de landing page"
                    className="flex-1"
                  />
                  {item.needsReview && (
                    <Badge variant="warning" className="shrink-0 gap-1">
                      <AlertTriangle className="size-3" />
                      Por definir
                    </Badge>
                  )}
                </div>
                <Textarea
                  value={item.description}
                  onChange={(e) => update(index, { description: e.target.value })}
                  placeholder="Detalle breve de este entregable (opcional)"
                  rows={2}
                  className="text-sm"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    value={item.pricingType ?? "fixed"}
                    onValueChange={(v) =>
                      update(index, {
                        pricingType: v as RatePricingType,
                        quantity: v === "hourly" ? (item.quantity ?? 1) : 1,
                      })
                    }
                  >
                    <SelectTrigger className="h-9 w-32 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRICING_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {isHourly && (
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        value={item.quantity ?? 1}
                        onChange={(e) =>
                          update(index, { quantity: Number(e.target.value) || 0 })
                        }
                        className="h-9 w-20 text-xs"
                      />
                      <span className="text-xs text-muted-foreground">horas ×</span>
                    </div>
                  )}

                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice ?? 0}
                    onChange={(e) =>
                      update(index, {
                        unitPrice: Number(e.target.value) || 0,
                        needsReview: false,
                      })
                    }
                    className="h-9 w-28 text-xs"
                  />

                  <span className="ml-auto text-sm font-semibold">
                    {currency} {subtotal.toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => remove(index)}
                className="mt-1 rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
        );
      })}

      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => onChange([...items, newItem()])}
      >
        <Plus className="size-3.5" />
        Añadir línea
      </Button>
    </div>
  );
}
