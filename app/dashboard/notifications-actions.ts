"use server";

import { createClient } from "@/lib/supabase/server";

export async function markNotificationsReadAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("profiles")
    .update({ notifications_read_at: new Date().toISOString() })
    .eq("id", user.id);
}
