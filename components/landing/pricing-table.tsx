import Link from "next/link";
import { Check, Flame } from "lucide-react";

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
        <span className="text-sm font-semibold uppercase tracking-wide text-primary">
          Precios
        </span>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Empieza gratis, crece cuando lo necesites
        </h2>
        <p className="mt-4 text-muted-foreground">
          Sin contratos largos, sin letra pequeña. Cancela cuando quieras.
        </p>
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
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow">
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
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {plan.period}
                  </span>
                </div>
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
                )}
              </CardContent>

              <CardFooter>
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
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
