import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

/**
 * Cliente con la service_role key: ignora RLS por completo.
 * Uso exclusivo en Route Handlers de servidor (webhooks, jobs de IA).
 * Nunca importar desde un componente cliente ni exponer la key con NEXT_PUBLIC_.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
