"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarClock,
  CheckCircle2,
  Clapperboard,
  LayoutTemplate,
  Loader2,
  Palette,
  PenLine,
  Sparkles,
  Target,
  Wand2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { NICHE_LABELS } from "@/lib/constants";
import { DEMO_SAMPLES, getDemoSample } from "@/lib/demo-summary";
import { cn } from "@/lib/utils";
import type { BriefNiche } from "@/types/database";

const NICHE_ICONS: Record<BriefNiche, typeof LayoutTemplate> = {
  web_design: LayoutTemplate,
  copywriting: PenLine,
  branding: Palette,
  video: Clapperboard,
};

const NICHES = Object.keys(DEMO_SAMPLES) as BriefNiche[];

const SIMULATION_MS = 2600;

export function HeroSimulator() {
  const [niche, setNiche] = useState<BriefNiche>("web_design");
  const [message, setMessage] = useState(DEMO_SAMPLES.web_design.chaoticMessage);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [elapsed, setElapsed] = useState(0);

  const sample = getDemoSample(niche);

  function handleNicheChange(next: BriefNiche) {
    setNiche(next);
    setMessage(DEMO_SAMPLES[next].chaoticMessage);
    setStatus("idle");
  }

  function handleGenerate() {
    if (status === "loading") return;
    setStatus("loading");
    const start = Date.now();
    window.setTimeout(() => {
      setElapsed(Math.round((Date.now() - start) / 100) / 10);
      setStatus("done");
    }, SIMULATION_MS);
  }

  return (
    <div className="w-full max-w-xl">
      <div className="rounded-2xl border border-border/80 bg-card p-1.5 shadow-xl shadow-primary/5">
        <div className="flex items-center justify-between gap-2 px-3.5 py-2.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <span className="size-2 rounded-full bg-destructive/70" />
            <span className="size-2 rounded-full bg-warning/70" />
            <span className="size-2 rounded-full bg-success/70" />
            <span className="ml-2">Simulador en vivo</span>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[11px] font-medium text-accent-foreground">
            <Sparkles className="size-3" />
            Demo interactiva
          </span>
        </div>

        <div className="rounded-xl bg-muted/40 p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap gap-1.5">
            {NICHES.map((n) => {
              const Icon = NICHE_ICONS[n];
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleNicheChange(n)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    niche === n
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="size-3.5" />
                  {NICHE_LABELS[n]}
                </button>
              );
            })}
          </div>

          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Mensaje real (o desordenado) de tu cliente
          </label>
          <Textarea
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setStatus("idle");
            }}
            rows={5}
            className="resize-none bg-background text-sm"
          />

          <Button
            onClick={handleGenerate}
            disabled={status === "loading" || message.trim().length === 0}
            variant="gradient"
            className="mt-3 w-full"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Generando brief con IA…
              </>
            ) : (
              <>
                <Wand2 className="size-4" />
                Generar brief en segundos
              </>
            )}
          </Button>

          <AnimatePresence mode="wait">
            {status === "done" && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="mt-4 space-y-3 rounded-xl border border-border bg-background p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success">
                    <CheckCircle2 className="size-3.5" />
                    Brief generado en {elapsed}s
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {NICHE_LABELS[niche]}
                  </span>
                </div>

                <SummaryRow
                  icon={Target}
                  label="Objetivo"
                  value={sample.summary.objective}
                />
                <SummaryRow
                  icon={Sparkles}
                  label="Entregables"
                  value={sample.summary.deliverables.join(" · ")}
                />
                <SummaryRow
                  icon={CalendarClock}
                  label="Deadline"
                  value={sample.summary.deadline ?? "No especificado"}
                />

                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="w-full"
                >
                  <Link href="/signup">
                    Crear briefs reales con mi cuenta
                  </Link>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Target;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-2.5">
      <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
        <Icon className="size-3.5" />
      </div>
      <div>
        <p className="text-xs font-semibold text-foreground">{label}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}
