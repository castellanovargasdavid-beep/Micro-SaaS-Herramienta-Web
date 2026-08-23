import type { Metadata } from "next";

import { BillingSection } from "@/components/dashboard/billing-section";
import { BrandSettingsForm } from "@/components/dashboard/brand-settings-form";
import { requireUser } from "@/lib/data/dashboard";

export const metadata: Metadata = { title: "Configuración" };

export default async function SettingsPage() {
  const { profile } = await requireUser();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestiona tu perfil, marca y plan de suscripción.
        </p>
      </div>

      <BillingSection plan={profile.plan} />
      <BrandSettingsForm profile={profile} />
    </div>
  );
}
