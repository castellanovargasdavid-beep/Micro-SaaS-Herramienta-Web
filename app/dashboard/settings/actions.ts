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
