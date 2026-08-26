"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const profileSchema = z.object({
  fullName: z.string().min(1, "Ingresa tu nombre"),
  brandName: z.string().optional(),
  brandColor: z.string().optional(),
  brandLogoUrl: z.string().url().optional().or(z.literal("")),
});

export interface UpdateProfileState {
  error?: string;
  success?: boolean;
}

export async function updateProfileAction(
  _prevState: UpdateProfileState,
  formData: FormData,
): Promise<UpdateProfileState> {
  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName"),
    brandName: formData.get("brandName"),
    brandColor: formData.get("brandColor"),
    brandLogoUrl: formData.get("brandLogoUrl"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      brand_name: parsed.data.brandName || null,
      brand_color: parsed.data.brandColor || null,
      brand_logo_url: parsed.data.brandLogoUrl || null,
    })
    .eq("id", user.id);

  if (error) return { error: "No se pudo guardar. Intenta de nuevo." };

  revalidatePath("/dashboard/settings");
  return { success: true };
}

const rateItemSchema = z.object({
  name: z.string().min(1, "Ponle un nombre a cada tarifa"),
  pricingType: z.enum(["fixed", "hourly", "monthly"]),
  amount: z.coerce.number().min(0),
});

const rateCardSchema = z.object({
  items: z.array(rateItemSchema),
  defaultCurrency: z.string().min(1).max(8),
  taxPercentage: z.coerce.number().min(0).max(100),
});

export async function saveRateCardAction(
  input: z.infer<typeof rateCardSchema>,
): Promise<UpdateProfileState> {
  const parsed = rateCardSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  // Reemplazo completo: más simple y seguro que diffear altas/bajas/ediciones
  // para una lista corta que el usuario edita como un todo.
  const { error: deleteError } = await supabase
    .from("rate_card_items")
    .delete()
    .eq("user_id", user.id);
  if (deleteError) return { error: "No se pudo guardar el catálogo de tarifas." };

  if (parsed.data.items.length > 0) {
    const { error: insertError } = await supabase.from("rate_card_items").insert(
      parsed.data.items.map((item, index) => ({
        user_id: user.id,
        name: item.name,
        pricing_type: item.pricingType,
        amount: item.amount,
        sort_order: index,
      })),
    );
    if (insertError) return { error: "No se pudo guardar el catálogo de tarifas." };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      default_currency: parsed.data.defaultCurrency,
      tax_percentage: parsed.data.taxPercentage,
    })
    .eq("id", user.id);
  if (profileError) return { error: "No se pudo guardar moneda/impuesto." };

  revalidatePath("/dashboard/settings");
  return { success: true };
}

const notionSchema = z.object({
  notionToken: z.string().optional(),
  notionDatabaseId: z.string().optional(),
});

export async function updateNotionSettingsAction(
  _prevState: UpdateProfileState,
  formData: FormData,
): Promise<UpdateProfileState> {
  const parsed = notionSchema.safeParse({
    notionToken: formData.get("notionToken"),
    notionDatabaseId: formData.get("notionDatabaseId"),
  });

  if (!parsed.success) {
    return { error: "Datos inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  const { error } = await supabase
    .from("profiles")
    .update({
      notion_token: parsed.data.notionToken || null,
      notion_database_id: parsed.data.notionDatabaseId || null,
    })
    .eq("id", user.id);

  if (error) return { error: "No se pudo guardar. Intenta de nuevo." };

  revalidatePath("/dashboard/settings");
  return { success: true };
}
