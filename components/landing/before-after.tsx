"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CalendarClock,
  Clapperboard,
  LayoutTemplate,
  MessageCircle,
  Palette,
  PenLine,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

import { NICHE_LABELS } from "@/lib/constants";
import { DEMO_SAMPLES } from "@/lib/demo-summary";
import { cn } from "@/lib/utils";
import type { BriefNiche } from "@/types/database";

const NICHES = Object.keys(DEMO_SAMPLES) as BriefNiche[];

const NICHE_ICONS: Record<BriefNiche, typeof LayoutTemplate> = {
  web_design: LayoutTemplate,
  copywriting: PenLine,
  branding: Palette,
  video: Clapperboard,
};

function splitIntoBubbles(message: string): string[] {
  const parts = message
    .split(/(?<=[.!?])\s+(?=[a-záéíóúñ])/i)
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts.slice(0, 4) : [message];
}

export function BeforeAfter() {
  const [niche, setNiche] = useState<BriefNiche>("web_design");
  const sample = DEMO_SAMPLES[niche];
  const bubbles = splitIntoBubbles(sample.chaoticMessage);

  return (
    <section id="comparativa" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-semibold uppercase tracking-wide text-brand-teal">
          Antes vs. Después
        </span>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          De un mensaje caótico a un brief que puedes ejecutar hoy
        </h2>
        <p className="mt-4 text-muted-foreground">
          Tus clientes no piensan en briefs, piensan en WhatsApp. Elige un
          rubro y mira la transformación.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-1.5">
        {NICHES.map((n) => {
          const Icon = NICHE_ICONS[n];
          return (
            <button
              key={n}
              type="button"
              onClick={() => setNiche(n)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                niche === n
                  ? "border-brand-teal bg-brand-teal text-white"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-3.5" />
              {NICHE_LABELS[n]}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={niche}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="mt-10 grid gap-8 lg:grid-cols-[1fr_auto_1fr] lg:items-center"
        >
          {/* Antes: chat de WhatsApp */}
          <div className="rounded-2xl border border-border bg-[#eefaf0] p-4 shadow-sm sm:p-6">
            <div className="mb-3 flex items-center gap-2 text-xs font-medium text-[#3b4a3b]">
              <MessageCircle className="size-4" />
              Mensaje del cliente
            </div>
            <div className="space-y-2">
              {bubbles.map((bubble, i) => (
                <ChatBubble key={i}>{bubble}</ChatBubble>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <div className="flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-brand-violet to-brand-teal text-white shadow-md">
              <ArrowRight className="size-5" />
            </div>
          </div>

          {/* Después: brief limpio */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-violet">
                <Sparkles className="size-3.5" />
                Brief generado por IA
              </span>
              <span className="rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-medium text-success">
                Listo para ejecutar
              </span>
            </div>

            <div className="space-y-4">
              <Field icon={Target} label="Objetivo">
                {sample.summary.objective}
              </Field>
              <Field icon={Sparkles} label="Entregables">
                {sample.summary.deliverables[0]}
              </Field>
              <Field icon={Users} label="Audiencia">
                {sample.summary.target_audience}
              </Field>
              <Field icon={CalendarClock} label="Deadline">
                {sample.summary.deadline ?? "No especificado"}
              </Field>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

function ChatBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-[#dcf8c6] px-3.5 py-2 text-sm text-[#1c2b1c] shadow-sm">
      {children}
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Target;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
        <Icon className="size-4" />
      </div>
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-sm text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}
