"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Calculator,
  FileSignature,
  ReceiptText,
  Settings2,
  Sparkles,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const RATE_CARD = [
  { name: "Diseño Landing Page", price: "600 €", unit: "fijo" },
  { name: "Desarrollo frontend", price: "45 €", unit: "/h" },
  { name: "Branding básico", price: "800 €", unit: "fijo" },
];

const BUDGET_LINES = [
  { name: "Tienda online básica", qty: null, price: "800 €" },
  { name: "Diseño de logo", qty: null, price: "800 €" },
  { name: "Copys para redes", qty: null, price: null, review: true },
];

const STEPS = [
  {
    icon: Settings2,
    title: "1. Configura tu tarifario",
    description:
      "Define tus servicios una sola vez: precio fijo, por hora o por mes. Agrega tu moneda e IVA.",
  },
  {
    icon: Calculator,
    title: "2. La IA cruza los entregables",
    description:
      "Claude lee el brief del cliente y encuentra el servicio que corresponde en tu catálogo, con subtotales listos.",
  },
  {
    icon: FileSignature,
    title: "3. Revisa y genera el PDF",
    description:
      "Ajusta horas o añade un descuento en segundos y genera la propuesta con firma digital habilitada.",
  },
];

export function AutoPricingDemo() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-brand-amber">
          <Wallet className="size-4" />
          Presupuestos automáticos
        </span>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Tu tarifario, convertido en presupuesto en segundos
        </h2>
        <p className="mt-4 text-muted-foreground">
          Configura tus precios una vez. BriefQuick los cruza con lo que pide
          cada cliente y arma el desglose — tú solo revisas y envías.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.4 }}
        className="mt-12 grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-center"
      >
        {/* Tu tarifario */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <ReceiptText className="size-3.5" />
            Tu catálogo de tarifas
          </span>
          <ul className="mt-3 space-y-2.5">
            {RATE_CARD.map((item) => (
              <li
                key={item.name}
                className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm"
              >
                <span className="font-medium">{item.name}</span>
                <span className="shrink-0 text-muted-foreground">
                  {item.price}
                  <span className="text-xs">{item.unit === "fijo" ? "" : item.unit}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-center">
          <div className="flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-brand-amber to-brand-orange text-white shadow-md">
            <ArrowRight className="size-5" />
          </div>
        </div>

        {/* Presupuesto generado */}
        <div className="rounded-2xl border border-brand-amber/30 bg-brand-amber/5 p-5 shadow-sm">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-amber">
            <Sparkles className="size-3.5" />
            Presupuesto sugerido por IA
          </span>
          <ul className="mt-3 space-y-2.5">
            {BUDGET_LINES.map((item) => (
              <li
                key={item.name}
                className="flex items-center justify-between rounded-lg bg-card px-3 py-2 text-sm shadow-sm"
              >
                <span className="font-medium">{item.name}</span>
                {item.review ? (
                  <span className="shrink-0 rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-medium text-warning">
                    Por definir · revisar
                  </span>
                ) : (
                  <span className="shrink-0 text-muted-foreground">{item.price}</span>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
            <span className="text-sm font-medium">Total (IVA incl.)</span>
            <span className="text-lg font-bold">1.936 €</span>
          </div>
        </div>
      </motion.div>

      <div className="mt-16 grid gap-8 sm:grid-cols-3">
        {STEPS.map((step) => (
          <div key={step.title} className="text-center sm:text-left">
            <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground sm:mx-0">
              <step.icon className="size-5" />
            </div>
            <h3 className="mt-3 text-sm font-semibold">{step.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-col items-center gap-3 text-center">
        <Button size="lg" variant="gradient" asChild>
          <Link href="/signup">
            Configura tu tarifario gratis
            <ArrowRight className="size-4" />
          </Link>
        </Button>
        <p className="text-xs text-muted-foreground">
          Gratis para empezar · sin tarjeta de crédito
        </p>
      </div>
    </section>
  );
}
