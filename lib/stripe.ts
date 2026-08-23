import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-07-29.dahlia",
  appInfo: { name: "BriefFast" },
});

export const STRIPE_PRICE_IDS = {
  pro_monthly: process.env.STRIPE_PRICE_PRO!,
  lifetime: process.env.STRIPE_PRICE_LTD!,
} as const;

export const LTD_SEATS_LIMIT = 100;
