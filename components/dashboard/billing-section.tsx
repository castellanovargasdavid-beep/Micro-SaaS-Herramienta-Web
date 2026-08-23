"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PLAN_LABELS } from "@/lib/constants";
import type { PlanType } from "@/types/database";

const PLAN_PERKS: Record<PlanType, string[]> = {
  free: ["Hasta 2 briefs activos/mes", "Resumen ejecutivo con IA", "Exportar a Markdown"],
  pro: ["Briefs ilimitados", "Personalización de marca", "Exportación a PDF y Notion"],
  lifetime: ["Todo lo de Pro, para siempre", "Sin pagos recurrentes", "Badge de fundador"],
};

export function BillingSection({ plan }: { plan: PlanType }) {
  const [loadingPlan, setLoadingPlan] = useState<"pro_monthly" | "lifetime" | null>(null);

  async function handleUpgrade(target: "pro_monthly" | "lifetime") {
    setLoadingPlan(target);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: target }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "No se pudo iniciar el pago.");
      window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo iniciar el pago.");
      setLoadingPlan(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          Plan actual
          <Badge variant={plan === "free" ? "secondary" : "success"}>
            {PLAN_LABELS[plan]}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pb-6">
        <ul className="space-y-1.5">
          {PLAN_PERKS[plan].map((perk) => (
            <li key={perk} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="size-3.5 text-success" />
              {perk}
            </li>
          ))}
        </ul>

        {plan === "free" && (
          <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row">
            <Button
              className="flex-1"
              variant="gradient"
              onClick={() => handleUpgrade("pro_monthly")}
              disabled={loadingPlan !== null}
            >
              {loadingPlan === "pro_monthly" && <Loader2 className="size-4 animate-spin" />}
              Actualizar a Pro — $12/mes
            </Button>
            <Button
              className="flex-1"
              variant="outline"
              onClick={() => handleUpgrade("lifetime")}
              disabled={loadingPlan !== null}
            >
              {loadingPlan === "lifetime" && <Loader2 className="size-4 animate-spin" />}
              Lifetime Deal — $49 único pago
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
