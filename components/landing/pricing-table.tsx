import Link from "next/link";
import { Check, Flame, Lock, RefreshCcw, ShieldCheck, XCircle, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PRICING_PLANS } from "@/lib/constants";
import { LTD_SEATS_LIMIT } from "@/lib/stripe";
import { cn } from "@/lib/utils";

export function PricingTable({ ltdSeatsRemaining }: { ltdSeatsRemaining: number }) {
  return (
    <section id="precios" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-semibold uppercase tracking-wide text-brand-violet">
          Precios
        </span>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Empieza gratis, crece cuando lo necesites
        </h2>
        <p className="mt-4 text-muted-foreground">
          Sin contratos largos, sin letra pequeña. Cancela cuando quieras.
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <XCircle className="size-3.5 text-success" />
            Sin tarjeta para el plan gratis
          </span>
          <span className="inline-flex items-center gap-1.5">
            <RefreshCcw className="size-3.5 text-success" />
            Cancela Pro cuando quieras
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-success" />
            Garantía de 15 días en Lifetime
          </span>
        </div>
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {PRICING_PLANS.map((plan) => {
          const isLtd = plan.id === "lifetime";
          const seatsUsed = LTD_SEATS_LIMIT - ltdSeatsRemaining;
          const seatsPct = Math.min(
            100,
            Math.round((seatsUsed / LTD_SEATS_LIMIT) * 100),
          );

          return (
            <Card
              key={plan.id}
              className={cn(
                "relative flex flex-col",
                plan.highlighted && "border-primary shadow-lg shadow-primary/10",
              )}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-violet to-brand-pink px-3 py-1 text-xs font-semibold text-white shadow">
                  Más popular
                </span>
              )}

              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  {isLtd && (
                    <Badge variant="warning" className="gap-1">
                      <Flame className="size-3" />
                      {plan.badge}
                    </Badge>
                  )}
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  {"originalPrice" in plan && (
                    <span className="text-lg text-muted-foreground line-through">
                      {plan.originalPrice}
                    </span>
                  )}
                  <span className="text-4xl font-bold tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {plan.period}
                  </span>
                </div>
                {"priceNote" in plan && (
                  <span className="inline-flex w-fit items-center gap-1 text-xs font-semibold text-brand-orange">
                    <Zap className="size-3" />
                    {plan.priceNote}
                  </span>
                )}
                <CardDescription className="pt-1">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-success" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {isLtd && (
                  <>
                    <div className="mt-5 rounded-xl border border-dashed border-border p-3.5 text-xs">
                      <div className="flex items-center justify-between py-1 text-muted-foreground">
                        <span>Suscripción típica</span>
                        <span>~$20/mes · $240/año</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-border/60 py-1 pt-2 font-semibold">
                        <span>BriefQuick Lifetime</span>
                        <span className="text-success">$49 una vez, para siempre</span>
                      </div>
                    </div>

                    <div className="mt-5">
                      <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{seatsUsed}/{LTD_SEATS_LIMIT} cupos usados</span>
                        <span>{ltdSeatsRemaining} disponibles</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-warning"
                          style={{ width: `${seatsPct}%` }}
                        />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>

              <CardFooter className="flex-col gap-2.5">
                {isLtd && ltdSeatsRemaining <= 0 ? (
                  <Button variant="outline" className="w-full" disabled>
                    Cupos agotados
                  </Button>
                ) : (
                  <Button
                    asChild
                    variant={plan.highlighted ? "gradient" : "outline"}
                    className="w-full"
                  >
                    <Link
                      href={
                        plan.id === "free" ? "/signup" : `/signup?plan=${plan.id}`
                      }
                    >
                      {plan.cta}
                    </Link>
                  </Button>
                )}
                {isLtd && (
                  <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Lock className="size-3 text-success" />
                      Pago seguro SSL
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <ShieldCheck className="size-3 text-success" />
                      Garantía de 15 días
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Zap className="size-3 text-success" />
                      Acceso inmediato
                    </span>
                  </div>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
