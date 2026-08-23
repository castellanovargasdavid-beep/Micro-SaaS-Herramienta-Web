"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PartyPopper, X } from "lucide-react";
import { useState } from "react";

import { NICHE_LABELS } from "@/lib/constants";
import type { BriefNiche } from "@/types/database";

export function WelcomeBanner() {
  const searchParams = useSearchParams();
  const [dismissed, setDismissed] = useState(false);

  const template = searchParams.get("template");
  const plan = searchParams.get("plan");
  const checkoutStatus = searchParams.get("checkout");

  if (dismissed) return null;

  if (checkoutStatus === "success") {
    return (
      <Banner onDismiss={() => setDismissed(true)}>
        ¡Pago confirmado! Tu plan se actualizará en unos segundos.
      </Banner>
    );
  }

  if (template && template in NICHE_LABELS) {
    return (
      <Banner onDismiss={() => setDismissed(true)}>
        ¡Bienvenido! Usa el botón <strong>Nuevo brief</strong> y elige la
        plantilla de <strong>{NICHE_LABELS[template as BriefNiche]}</strong>{" "}
        para empezar en segundos.
      </Banner>
    );
  }

  if (plan) {
    return (
      <Banner onDismiss={() => setDismissed(true)}>
        Ve a{" "}
        <Link href="/dashboard/settings" className="underline">
          Configuración
        </Link>{" "}
        para completar tu actualización al plan {plan === "lifetime" ? "Lifetime" : "Pro"}.
      </Banner>
    );
  }

  return null;
}

function Banner({ children, onDismiss }: { children: React.ReactNode; onDismiss: () => void }) {
  return (
    <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
      <span className="flex items-center gap-2">
        <PartyPopper className="size-4 text-primary" />
        {children}
      </span>
      <button onClick={onDismiss} className="text-muted-foreground hover:text-foreground">
        <X className="size-4" />
      </button>
    </div>
  );
}
