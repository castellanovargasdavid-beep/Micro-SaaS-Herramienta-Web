"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  FileSignature,
  Mic,
  Pause,
  Play,
  Sparkles,
  Target,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const VOICE_NOTE_TRANSCRIPT =
  "Ehh hola, disculpa, te hablo rápido porque ando manejando jaja... necesito " +
  "un video para mi marca de ropa, algo para Instagram, no sé bien cuánto " +
  "debería durar. Ah, y lo necesito antes del viernes porque lanzamos una " +
  "promo. Cuéntame cuánto me cobrarías.";

const WAVEFORM_BARS = [
  6, 14, 9, 20, 12, 24, 10, 18, 8, 22, 14, 10, 26, 12, 18, 8, 20, 14, 10, 16,
];

export function VoiceToProposalDemo() {
  const [status, setStatus] = useState<"idle" | "playing" | "transcribed" | "done">(
    "idle",
  );

  function handlePlay() {
    if (status !== "idle") return;
    setStatus("playing");
    window.setTimeout(() => setStatus("transcribed"), 1600);
    window.setTimeout(() => setStatus("done"), 3000);
  }

  return (
    <section className="bg-muted/30 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-brand-blue">
            <Mic className="size-4" />
            Demo interactiva · notas de voz
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            De una nota de voz desordenada a una propuesta lista para firmar
          </h2>
          <p className="mt-4 text-muted-foreground">
            Tu cliente no tiene por qué escribir. Graba una nota como en
            WhatsApp — BriefFast la transcribe, la convierte en brief y arma
            la propuesta.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
          {/* Antes: nota de voz */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <span className="text-xs font-medium text-muted-foreground">
              Nota de voz del cliente
            </span>
            <button
              type="button"
              onClick={handlePlay}
              disabled={status !== "idle"}
              className="mt-3 flex w-full items-center gap-3 rounded-xl bg-[#dcf8c6] px-4 py-3 text-left transition-opacity disabled:cursor-default"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#1c2b1c] text-white">
                {status === "idle" ? (
                  <Play className="size-4" />
                ) : (
                  <Pause className="size-4" />
                )}
              </span>
              <span className="flex flex-1 items-center gap-0.5">
                {WAVEFORM_BARS.map((h, i) => (
                  <span
                    key={i}
                    className={cn(
                      "w-1 rounded-full bg-[#1c2b1c]/50 transition-all",
                      status !== "idle" && i < 12 && "bg-[#1c2b1c]",
                    )}
                    style={{ height: `${h}px` }}
                  />
                ))}
              </span>
              <span className="shrink-0 text-xs font-medium text-[#1c2b1c]">0:18</span>
            </button>

            <AnimatePresence>
              {(status === "transcribed" || status === "done") && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 rounded-lg bg-muted/60 p-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-blue">
                      <Sparkles className="size-3" />
                      Transcrito automáticamente
                    </span>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {VOICE_NOTE_TRANSCRIPT}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {status === "idle" && (
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Toca para escuchar el ejemplo
              </p>
            )}
          </div>

          <div className="flex justify-center">
            <div className="flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-brand-blue to-brand-violet text-white shadow-md">
              <ArrowRight className="size-5" />
            </div>
          </div>

          {/* Después: brief + propuesta */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {status !== "done" ? (
                <motion.div
                  key="waiting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex h-full min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-border p-6 text-center"
                >
                  <Sparkles className="size-6 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    {status === "playing"
                      ? "Transcribiendo con Whisper…"
                      : status === "transcribed"
                        ? "Generando brief con Claude…"
                        : "Aquí aparecerá el brief y la propuesta"}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-3"
                >
                  <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-violet">
                      <Sparkles className="size-3.5" />
                      Brief generado
                    </span>
                    <div className="mt-3 space-y-2.5">
                      <div className="flex gap-2">
                        <Target className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">Objetivo: </span>
                          Video promocional para Instagram anunciando una
                          promoción de ropa.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <CalendarClock className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">Deadline: </span>
                          Antes del viernes — urgente
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-brand-teal/30 bg-brand-teal/5 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-teal">
                        <FileSignature className="size-3.5" />
                        Propuesta comercial
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success">
                        <CheckCircle2 className="size-2.5" />
                        Lista para enviar
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold">
                      Video promocional Instagram — $250 USD
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Reel vertical de 15-30s, edición y música incluida.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          <Button size="lg" variant="gradient" asChild>
            <Link href="/signup">
              Probar con mi propia nota de voz
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">
            Gratis para empezar · sin tarjeta de crédito
          </p>
        </div>
      </div>
    </section>
  );
}
