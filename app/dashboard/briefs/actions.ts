"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import type { BriefNiche, BriefQuestion } from "@/types/database";

const createBriefSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  templateId: z.string().uuid().nullable(),
});

export interface CreateBriefState {
  error?: string;
}

export async function createBriefAction(
  _prevState: CreateBriefState,
  formData: FormData,
): Promise<CreateBriefState> {
  const parsed = createBriefSchema.safeParse({
    title: formData.get("title"),
    templateId: formData.get("templateId") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let niche: BriefNiche = "web_design";
  let questions: BriefQuestion[] = [];

  if (parsed.data.templateId) {
    const { data: template } = await supabase
      .from("brief_templates")
      .select("niche, questions")
      .eq("id", parsed.data.templateId)
      .single();

    if (template) {
      niche = template.niche;
      questions = template.questions;
    }
  }

  const { data: brief, error } = await supabase
    .from("briefs")
    .insert({
      user_id: user.id,
      title: parsed.data.title,
      template_id: parsed.data.templateId,
      niche,
      questions,
      status: "draft",
    })
    .select("id")
    .single();

  if (error || !brief) {
    return {
      error: error?.message.includes("free_plan_limit_reached")
        ? "Alcanzaste el límite de 2 briefs activos del plan Free. Actualiza a Pro para crear más."
        : "No se pudo crear el brief. Intenta de nuevo.",
    };
  }

  revalidatePath("/dashboard");
  redirect(`/dashboard/briefs/${brief.id}`);
}

const updateBriefSchema = z.object({
  briefId: z.string().uuid(),
  title: z.string().min(3),
  introMessage: z.string().optional(),
  brandColor: z.string().optional(),
  questions: z.array(
    z.object({
      id: z.string(),
      type: z.enum(["text", "textarea", "select", "date", "email", "url"]),
      label: z.string().min(1),
      placeholder: z.string().optional(),
      required: z.boolean(),
      options: z.array(z.string()).optional(),
    }),
  ),
});

export interface UpdateBriefState {
  error?: string;
  success?: boolean;
}

export async function updateBriefAction(
  input: z.infer<typeof updateBriefSchema>,
): Promise<UpdateBriefState> {
  const parsed = updateBriefSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("briefs")
    .update({
      title: parsed.data.title,
      intro_message: parsed.data.introMessage || null,
      brand_color: parsed.data.brandColor || null,
      questions: parsed.data.questions,
    })
    .eq("id", parsed.data.briefId);

  if (error) return { error: "No se pudo guardar. Intenta de nuevo." };

  revalidatePath(`/dashboard/briefs/${parsed.data.briefId}`);
  return { success: true };
}

export async function setBriefStatusAction(
  briefId: string,
  status: "draft" | "published" | "archived",
) {
  const supabase = await createClient();
  await supabase.from("briefs").update({ status }).eq("id", briefId);
  revalidatePath(`/dashboard/briefs/${briefId}`);
  revalidatePath("/dashboard");
}

export async function deleteBriefAction(briefId: string) {
  const supabase = await createClient();
  await supabase.from("briefs").delete().eq("id", briefId);
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
