import { NextResponse } from "next/server";
import { z } from "zod";

import { APP_URL } from "@/lib/constants";
import { getStripe, STRIPE_PRICE_IDS } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  plan: z.enum(["pro_monthly", "lifetime"]),
});

export async function POST(request: Request) {
  const stripe = getStripe();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Plan inválido." }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, email")
    .eq("id", user.id)
    .single();

  let customerId = profile?.stripe_customer_id ?? undefined;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email ?? user.email ?? undefined,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;

    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const isLifetime = parsed.data.plan === "lifetime";

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: isLifetime ? "payment" : "subscription",
    line_items: [
      {
        price: STRIPE_PRICE_IDS[parsed.data.plan],
        quantity: 1,
      },
    ],
    success_url: `${APP_URL}/dashboard?checkout=success`,
    cancel_url: `${APP_URL}/dashboard?checkout=cancelled`,
    client_reference_id: user.id,
    metadata: { supabase_user_id: user.id, plan: parsed.data.plan },
  });

  return NextResponse.json({ url: session.url });
}
