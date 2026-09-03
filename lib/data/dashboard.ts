import { redirect } from "next/navigation";

import { FREE_PLAN_ACTIVE_BRIEFS_LIMIT } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  return { supabase, user, profile: profile as Profile };
}

export async function getActiveBriefsThisMonth(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("briefs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .in("status", ["draft", "published"])
    .gte("created_at", startOfMonth.toISOString());

  return count ?? 0;
}

export function canCreateBrief(profile: Profile, activeThisMonth: number) {
  if (profile.plan !== "free") return true;
  return activeThisMonth < FREE_PLAN_ACTIVE_BRIEFS_LIMIT;
}

export interface NotificationItem {
  id: string;
  briefId: string;
  briefTitle: string;
  clientName: string | null;
  createdAt: string;
}

/**
 * Últimas respuestas de clientes para la campana del dashboard. RLS
 * (submissions_owner_select / briefs_owner_select) ya limita todo esto a
 * los briefs del usuario autenticado — no hace falta filtrar por user_id
 * a mano. "No leída" = llegó después de profiles.notifications_read_at.
 */
export async function getNotifications(
  supabase: Awaited<ReturnType<typeof createClient>>,
  notificationsReadAt: string,
): Promise<{ items: NotificationItem[]; unreadCount: number }> {
  const { data: submissions } = await supabase
    .from("submissions")
    .select("id, brief_id, client_name, created_at")
    .order("created_at", { ascending: false })
    .limit(8);

  if (!submissions || submissions.length === 0) {
    return { items: [], unreadCount: 0 };
  }

  const briefIds = [...new Set(submissions.map((s) => s.brief_id))];
  const { data: briefs } = await supabase
    .from("briefs")
    .select("id, title")
    .in("id", briefIds);

  const titleById = new Map((briefs ?? []).map((b) => [b.id, b.title]));
  const readAtMs = new Date(notificationsReadAt).getTime();

  const items: NotificationItem[] = submissions.map((s) => ({
    id: s.id,
    briefId: s.brief_id,
    briefTitle: titleById.get(s.brief_id) ?? "Brief",
    clientName: s.client_name,
    createdAt: s.created_at,
  }));

  const unreadCount = items.filter(
    (item) => new Date(item.createdAt).getTime() > readAtMs,
  ).length;

  return { items, unreadCount };
}
