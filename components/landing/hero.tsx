import Link from "next/link";
import { ArrowRight, Sparkles, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { HeroSimulator } from "@/components/landing/hero-simulator";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,black,transparent)]" />
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />

      <div className="mx-auto grid max-w-6xl gap-12 px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28 lg:grid-cols-2 lg:items-center lg:gap-8">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
            <Zap className="size-3.5 text-primary" />
            Del mensaje de WhatsApp al brief ejecutable
          </span>

          <h1 className="mt-5 text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-[3.25rem] lg:leading-[1.05]">
            Briefs claros para tus clientes,{" "}
            <span className="bg-gradient-to-r from-primary to-fuchsia-500 bg-clip-text text-transparent">
              generados con IA
            </span>{" "}
            en minutos
          </h1>

          <p className="mt-5 max-w-lg text-lg text-muted-foreground">
            BriefFast convierte los requerimientos desordenados de tus
            clientes en briefs estructurados y accionables. Envía un
            formulario, recibe respuestas, obtén un resumen ejecutivo listo
            para trabajar.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" variant="gradient" asChild>
              <Link href="/signup">
                Empezar gratis
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#comparativa">
                <Sparkles className="size-4" />
                Ver cómo funciona
              </Link>
            </Button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Sin tarjeta de crédito · Hasta 2 briefs activos gratis cada mes
          </p>
        </div>

        <div className="flex justify-center lg:justify-end">
          <HeroSimulator />
        </div>
      </div>
    </section>
  );
}
