import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Star, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { HeroSimulator } from "@/components/landing/hero-simulator";

const SOCIAL_PROOF_AVATARS = [22, 44, 5, 61];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="bg-mesh pointer-events-none absolute inset-0" />
      <div className="animate-blob pointer-events-none absolute -top-24 -left-24 -z-10 size-[26rem] rounded-full bg-brand-violet/18 blur-3xl" />
      <div className="animate-blob-delay pointer-events-none absolute -top-10 right-0 -z-10 size-[22rem] rounded-full bg-brand-pink/14 blur-3xl" />

      <div className="mx-auto grid max-w-6xl gap-12 px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28 lg:grid-cols-2 lg:items-center lg:gap-8">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
            <Zap className="size-3.5 text-brand-orange" />
            Del mensaje de WhatsApp al brief ejecutable
          </span>

          <h1 className="mt-5 text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-[3.25rem] lg:leading-[1.05]">
            Briefs claros para tus clientes,{" "}
            <span className="bg-gradient-to-r from-brand-violet via-brand-pink to-brand-orange bg-clip-text text-transparent">
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

          <div className="mt-7 flex items-center gap-3">
            <div className="flex -space-x-2.5">
              {SOCIAL_PROOF_AVATARS.map((seed) => (
                <Image
                  key={seed}
                  src={`https://i.pravatar.cc/64?img=${seed}`}
                  alt=""
                  width={32}
                  height={32}
                  unoptimized
                  className="size-8 rounded-full border-2 border-background object-cover"
                />
              ))}
            </div>
            <div className="text-xs text-muted-foreground">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-3 fill-brand-amber text-brand-amber" />
                ))}
              </div>
              <span>Usado por freelancers y agencias boutique</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <HeroSimulator />
        </div>
      </div>
    </section>
  );
}
