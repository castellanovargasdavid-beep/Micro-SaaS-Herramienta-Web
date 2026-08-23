import { LTD_SEATS_LIMIT } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Cupos restantes del Lifetime Deal. Si Supabase aún no está configurado
 * (por ejemplo durante el primer despliegue, antes de cargar las variables
 * de entorno) se asume el cupo completo disponible en vez de romper el build.
 */
export async function getLtdSeatsRemaining(): Promise<number> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return LTD_SEATS_LIMIT;
  }

  try {
    const supabase = createAdminClient();
    const { count, error } = await supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("plan", "lifetime");

    if (error) throw error;

    return Math.max(LTD_SEATS_LIMIT - (count ?? 0), 0);
  } catch {
    return LTD_SEATS_LIMIT;
  }
}
