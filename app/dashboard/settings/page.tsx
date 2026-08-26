import type { Metadata } from "next";

import { BillingSection } from "@/components/dashboard/billing-section";
import { BrandSettingsForm } from "@/components/dashboard/brand-settings-form";
import { NotionSettingsForm } from "@/components/dashboard/notion-settings-form";
import { RateCardForm } from "@/components/dashboard/rate-card-form";
import { requireUser } from "@/lib/data/dashboard";

export const metadata: Metadata = { title: "Configuración" };

export default async function SettingsPage() {
  const { supabase, user, profile } = await requireUser();

  const { data: rateCardItems } = await supabase
    .from("rate_card_items")
    .select("*")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: true });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestiona tu perfil, marca, integraciones y plan de suscripción.
        </p>
      </div>

      <BillingSection plan={profile.plan} />
      <BrandSettingsForm profile={profile} />
      <RateCardForm profile={profile} rateCardItems={rateCardItems ?? []} />
      <NotionSettingsForm profile={profile} />
    </div>
  );
}
