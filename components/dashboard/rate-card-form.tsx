"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { saveRateCardAction } from "@/app/dashboard/settings/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Profile, RateCardItem, RatePricingType } from "@/types/database";

const PRICING_TYPE_LABELS: Record<RatePricingType, string> = {
  fixed: "Precio fijo",
  hourly: "Por hora",
  monthly: "Por mes",
};

interface RateRow {
  key: string;
  name: string;
  pricingType: RatePricingType;
  amount: string;
}

function toRows(items: RateCardItem[]): RateRow[] {
  if (items.length === 0) {
    return [{ key: crypto.randomUUID(), name: "", pricingType: "fixed", amount: "" }];
  }
  return items.map((item) => ({
    key: item.id,
    name: item.name,
    pricingType: item.pricing_type,
    amount: item.amount.toString(),
  }));
}

export function RateCardForm({
  profile,
  rateCardItems,
}: {
  profile: Profile;
  rateCardItems: RateCardItem[];
}) {
  const [rows, setRows] = useState<RateRow[]>(toRows(rateCardItems));
  const [defaultCurrency, setDefaultCurrency] = useState(profile.default_currency);
  const [taxPercentage, setTaxPercentage] = useState(profile.tax_percentage.toString());
  const [isPending, startTransition] = useTransition();

  function updateRow(key: string, patch: Partial<RateRow>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function removeRow(key: string) {
    setRows((prev) => prev.filter((r) => r.key !== key));
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      { key: crypto.randomUUID(), name: "", pricingType: "fixed", amount: "" },
    ]);
  }

  function handleSave() {
    const items = rows
      .filter((r) => r.name.trim())
      .map((r) => ({
        name: r.name.trim(),
        pricingType: r.pricingType,
        amount: Number(r.amount) || 0,
      }));

    startTransition(async () => {
      const result = await saveRateCardAction({
        items,
        defaultCurrency: defaultCurrency.trim() || "USD",
        taxPercentage: Number(taxPercentage) || 0,
      });
      if (result.error) toast.error(result.error);
      else toast.success("Catálogo de tarifas guardado");
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Catálogo de tarifas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pb-6">
        <p className="text-xs text-muted-foreground">
          Define tus precios base. Cuando crees una propuesta desde un brief,
          la IA cruza los entregables detectados con este catálogo y arma un
          presupuesto sugerido — siempre editable antes de enviarlo.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="defaultCurrency">Moneda por defecto</Label>
            <Input
              id="defaultCurrency"
              value={defaultCurrency}
              onChange={(e) => setDefaultCurrency(e.target.value.toUpperCase())}
              placeholder="USD, EUR, MXN..."
              maxLength={8}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="taxPercentage">Impuesto por defecto (%)</Label>
            <Input
              id="taxPercentage"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={taxPercentage}
              onChange={(e) => setTaxPercentage(e.target.value)}
              placeholder="Ej: 21 (IVA)"
            />
          </div>
        </div>

        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row.key} className="flex items-center gap-2 rounded-lg border border-border p-2.5">
              <Input
                value={row.name}
                onChange={(e) => updateRow(row.key, { name: e.target.value })}
                placeholder="Ej: Diseño landing page"
                className="flex-1"
              />
              <Select
                value={row.pricingType}
                onValueChange={(v) => updateRow(row.key, { pricingType: v as RatePricingType })}
              >
                <SelectTrigger className="h-10 w-36 text-xs">
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
              <Input
                type="number"
                min="0"
                step="0.01"
                value={row.amount}
                onChange={(e) => updateRow(row.key, { amount: e.target.value })}
                placeholder="Monto"
                className="w-28"
              />
              <button
                type="button"
                onClick={() => removeRow(row.key)}
                className="shrink-0 rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>

        <Button type="button" size="sm" variant="outline" onClick={addRow}>
          <Plus className="size-3.5" />
          Añadir tarifa
        </Button>
      </CardContent>
      <div className="border-t border-border px-6 py-4">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Guardar catálogo
        </Button>
      </div>
    </Card>
  );
}
