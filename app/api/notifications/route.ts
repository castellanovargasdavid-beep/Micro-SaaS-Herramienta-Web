import { NextResponse } from "next/server";

import { getNotifications } from "@/lib/data/dashboard";
import { createClient } from "@/lib/supabase/server";

/**
 * Consultado por la campana del dashboard cada cierto tiempo para saber si
 * llegaron respuestas nuevas sin recargar la página.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("notifications_read_at")
    .eq("id", user.id)
    .maybeSingle();

  const { items, unreadCount } = await getNotifications(
    supabase,
    profile?.notifications_read_at ?? new Date(0).toISOString(),
  );

  return NextResponse.json({ items, unreadCount });
}
