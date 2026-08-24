import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 sm:pb-28">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-violet via-brand-pink to-brand-orange px-6 py-16 text-center shadow-xl sm:px-12 sm:py-20">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-10" />
        <h2 className="relative text-3xl font-bold tracking-tight text-balance text-white sm:text-4xl">
          Deja de perseguir a tus clientes por WhatsApp
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-white/85">
          Crea tu primer brief gratis en menos de 2 minutos y descubre lo
          rápido que se siente empezar un proyecto con claridad total.
        </p>
        <div className="relative mt-8 flex justify-center">
          <Button size="lg" variant="secondary" asChild>
            <Link href="/signup">
              Crear mi primer brief gratis
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
