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
