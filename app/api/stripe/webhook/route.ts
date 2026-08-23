import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import type { SubscriptionPlan, SubscriptionStatus } from "@/types/database";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const payload = await request.text();

  if (!signature) {
    return NextResponse.json({ error: "Falta la firma de Stripe." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error("[stripe webhook] firma inválida:", err);
    return NextResponse.json({ error: "Firma inválida." }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.supabase_user_id;
      const plan = session.metadata?.plan as SubscriptionPlan | undefined;

      if (!userId || !plan) break;

      const customerId =
        typeof session.customer === "string"
          ? session.customer
          : session.customer?.id;
      if (!customerId) break;

      if (plan === "pro_monthly" && typeof session.subscription === "string") {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription,
        );
        await upsertSubscription(supabase, {
          userId,
          plan,
          status: subscription.status as SubscriptionStatus,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscription.id,
          stripePriceId: subscription.items.data[0]?.price.id ?? null,
          currentPeriodEnd: subscription.items.data[0]?.current_period_end
            ? new Date(
                subscription.items.data[0].current_period_end * 1000,
              ).toISOString()
            : null,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        });
        await supabase.from("profiles").update({ plan: "pro" }).eq("id", userId);
      }

      if (plan === "lifetime") {
        await upsertSubscription(supabase, {
          userId,
          plan,
          status: "active",
          stripeCustomerId: customerId,
          stripeSubscriptionId: null,
          stripePriceId: null,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
        });
        await supabase
          .from("profiles")
          .update({ plan: "lifetime" })
          .eq("id", userId);
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const { data: existing } = await supabase
        .from("subscriptions")
        .select("user_id, plan")
        .eq("stripe_subscription_id", subscription.id)
        .maybeSingle();

      if (!existing) break;

      const status = subscription.status as SubscriptionStatus;
      const isActive = status === "active" || status === "trialing";

      await supabase
        .from("subscriptions")
        .update({
          status,
          cancel_at_period_end: subscription.cancel_at_period_end,
          current_period_end: subscription.items.data[0]?.current_period_end
            ? new Date(
                subscription.items.data[0].current_period_end * 1000,
              ).toISOString()
            : null,
        })
        .eq("stripe_subscription_id", subscription.id);

      await supabase
        .from("profiles")
        .update({ plan: isActive ? "pro" : "free" })
        .eq("id", existing.user_id);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}

async function upsertSubscription(
  supabase: ReturnType<typeof createAdminClient>,
  params: {
    userId: string;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    stripeCustomerId: string;
    stripeSubscriptionId: string | null;
    stripePriceId: string | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  },
) {
  await supabase.from("subscriptions").upsert(
    {
      user_id: params.userId,
      plan: params.plan,
      status: params.status,
      stripe_customer_id: params.stripeCustomerId,
      stripe_subscription_id: params.stripeSubscriptionId,
      stripe_price_id: params.stripePriceId,
      current_period_end: params.currentPeriodEnd,
      cancel_at_period_end: params.cancelAtPeriodEnd,
    },
    { onConflict: "user_id" },
  );
}
