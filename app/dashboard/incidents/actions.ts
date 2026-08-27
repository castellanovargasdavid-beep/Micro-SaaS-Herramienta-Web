"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const incidentInputSchema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  priority: z.enum(["Baja", "Media", "Alta", "Crítica"]),
  type: z.enum(["Error", "Bug", "Petición", "Soporte técnico"]),
  description: z.string().min(1, "La descripción es obligatoria"),
  reproSteps: z.array(z.string()).default([]),
  contactName: z.string().nullable().optional(),
  contactEmail: z.string().nullable().optional(),
  contactPhone: z.string().nullable().optional(),
  suggestedActions: z.array(z.string()).default([]),
  rawInput: z.string().default(""),
  source: z.enum(["text", "audio"]).default("text"),
});

export type IncidentInput = z.infer<typeof incidentInputSchema>;

export interface IncidentActionState {
  error?: string;
  id?: string;
}

export async function createIncidentAction(
  input: IncidentInput,
): Promise<IncidentActionState> {
  const parsed = incidentInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: incident, error } = await supabase
    .from("incidents")
    .insert({
      user_id: user.id,
      title: parsed.data.title,
      priority: parsed.data.priority,
      type: parsed.data.type,
      description: parsed.data.description,
      repro_steps: parsed.data.reproSteps,
      contact_name: parsed.data.contactName || null,
      contact_email: parsed.data.contactEmail || null,
      contact_phone: parsed.data.contactPhone || null,
      suggested_actions: parsed.data.suggestedActions,
      raw_input: parsed.data.rawInput,
      source: parsed.data.source,
      status: "confirmed",
    })
    .select("id")
    .single();

  if (error || !incident) {
    return { error: "No se pudo guardar la incidencia. Intenta de nuevo." };
  }

  revalidatePath("/dashboard/incidents");
  return { id: incident.id };
}

export async function updateIncidentAction(
  incidentId: string,
  input: IncidentInput,
): Promise<IncidentActionState> {
  const parsed = incidentInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("incidents")
    .update({
      title: parsed.data.title,
      priority: parsed.data.priority,
      type: parsed.data.type,
      description: parsed.data.description,
      repro_steps: parsed.data.reproSteps,
      contact_name: parsed.data.contactName || null,
      contact_email: parsed.data.contactEmail || null,
      contact_phone: parsed.data.contactPhone || null,
      suggested_actions: parsed.data.suggestedActions,
    })
    .eq("id", incidentId);

  if (error) return { error: "No se pudo guardar. Intenta de nuevo." };

  revalidatePath(`/dashboard/incidents/${incidentId}`);
  revalidatePath("/dashboard/incidents");
  return {};
}

export async function setIncidentStatusAction(
  incidentId: string,
  status: "confirmed" | "archived",
) {
  const supabase = await createClient();
  await supabase.from("incidents").update({ status }).eq("id", incidentId);
  revalidatePath(`/dashboard/incidents/${incidentId}`);
  revalidatePath("/dashboard/incidents");
}

export async function deleteIncidentAction(incidentId: string) {
  const supabase = await createClient();
  await supabase.from("incidents").delete().eq("id", incidentId);
  revalidatePath("/dashboard/incidents");
  redirect("/dashboard/incidents");
}
