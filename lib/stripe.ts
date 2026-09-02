import Stripe from "stripe";

let _stripe: Stripe | null = null;

/**
 * Instancia perezosa: si se creara a nivel de módulo, Next.js la
 * inicializaría al importar las rutas API durante `next build`, y el SDK de
 * Stripe lanza una excepción cuando STRIPE_SECRET_KEY no está definido —
 * eso rompía el build en plataformas donde las env vars aún no están
 * configuradas. Al crearla dentro de una función, solo se instancia cuando
 * una request real la necesita (runtime, no build time).
 */
export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-07-29.dahlia",
      appInfo: { name: "BriefQuick" },
    });
  }
  return _stripe;
}

export const STRIPE_PRICE_IDS = {
  pro_monthly: process.env.STRIPE_PRICE_PRO!,
  lifetime: process.env.STRIPE_PRICE_LTD!,
} as const;

export const LTD_SEATS_LIMIT = 100;
