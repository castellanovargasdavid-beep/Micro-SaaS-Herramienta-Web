"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  FilePlus2,
  type LucideIcon,
  Mail,
  MessageCircle,
  Mic,
  Share2,
  Sparkles,
  UserPlus,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface FieldGuide {
  label: string;
  hint: string;
  example: string;
}

interface GuideStep {
  icon: LucideIcon;
  title: string;
  summary: string;
  details?: string[];
  fields?: FieldGuide[];
}

const STEPS: GuideStep[] = [
  {
    icon: UserPlus,
    title: "Crea tu cuenta gratis",
    summary: "Sin tarjeta, listo en menos de un minuto.",
    details: [
      "Ve a la página de registro, pon tu nombre, correo y contraseña.",
      "Confirma tu cuenta desde el correo que te enviamos.",
      "Entras directo a tu panel — el plan gratis ya te deja crear hasta 2 briefs activos por mes.",
    ],
  },
  {
    icon: FilePlus2,
    title: "Crea tu brief",
    summary: "El formulario que le vas a mandar a tu cliente.",
    fields: [
      {
        label: "Título del brief",
        hint: "Nombre interno del proyecto — solo tú lo ves, tu cliente no.",
        example: "Sitio web para Panadería Doña Rosa",
      },
      {
        label: "Plantilla (opcional)",
        hint: "Elige un nicho (Diseño Web, Copywriting, Branding, Video) para arrancar con preguntas ya armadas, o crea el brief en blanco y arma tus propias preguntas.",
        example: "Diseño Web · 6 preguntas predefinidas",
      },
      {
        label: "Mensaje de bienvenida",
        hint: "Lo primero que lee tu cliente al abrir el enlace. Explícale en una línea para qué es el formulario y qué tan largo es.",
        example:
          "Cuéntanos sobre tu proyecto — te tomará unos 5 minutos y nos ayuda a preparar tu propuesta.",
      },
      {
        label: "Cada pregunta del formulario",
        hint: "Por pregunta defines: el texto, el tipo de respuesta (texto corto, texto largo, opción múltiple, fecha, correo o URL) y si es obligatoria. Si eliges opción múltiple, escribe las opciones separadas por coma.",
        example:
          '"¿Cuál es el objetivo principal del proyecto?" — Texto largo — Obligatoria',
      },
      {
        label: "Color de marca (opcional)",
        hint: "El formulario público se pinta con tu color, para que se sienta parte de tu marca y no de una herramienta genérica.",
        example: "#6d28d9",
      },
    ],
  },
  {
    icon: Share2,
    title: "Publica y comparte el enlace",
    summary: "Un link único, sin registro para tu cliente.",
    details: [
      'Dale clic a "Publicar" — el brief pasa de borrador a publicado y se activa el enlace público.',
      "Copia el enlace desde tu panel (algo como brieffast.app/b/xxxxx).",
      "Mándaselo a tu cliente por WhatsApp, email o donde prefieras — no necesita crear cuenta ni instalar nada.",
    ],
  },
  {
    icon: MessageCircle,
    title: "Tu cliente responde",
    summary: "Sin cuenta, en su propio celular o computadora.",
    fields: [
      {
        label: "Nombre y correo",
        hint: "Lo primero que pide el formulario, para que sepas quién respondió.",
        example: "María López — maria@tiendaderopa.com",
      },
      {
        label: "Cada pregunta, una a la vez",
        hint: 'Responde con texto normal. Si una respuesta suena vaga (ej. "algo moderno"), la IA le repregunta ahí mismo para que aclare — tú no tienes que hacer nada.',
        example: '"Quiero que se vea profesional y moderno, con tonos claros"',
      },
      {
        label: "Notas de voz y archivos adjuntos",
        hint: "Puede grabar una nota de voz como en WhatsApp en vez de escribir, o adjuntar PDFs e imágenes de referencia — todo se transcribe y se lee automáticamente.",
        example: "🎤 Nota de voz (0:24) · logo-referencia.pdf",
      },
    ],
  },
  {
    icon: Sparkles,
    title: "Recibe el brief limpio",
    summary: "Listo para trabajar, sin ordenar nada tú mismo.",
    details: [
      "La respuesta llega a tu bandeja de entradas dentro del panel.",
      "La IA organiza todo en: objetivo, entregables, público objetivo, deadline y tono/estilo — a partir de lo que tu cliente realmente escribió, grabó o adjuntó.",
      "Exporta el resumen a PDF, Markdown o Notion, o úsalo directo para armar una propuesta con presupuesto sugerido por IA.",
    ],
  },
];

export function UsageGuide() {
  const [active, setActive] = useState(0);
  const step = STEPS[active];

  return (
    <section
      id="como-funciona"
      className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6 sm:py-28"
    >
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-semibold uppercase tracking-wide text-brand-orange">
          Guía de uso
        </span>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          De crear tu cuenta a recibir el brief, paso a paso
        </h2>
        <p className="mt-4 text-muted-foreground">
          Qué llenar en cada casilla, qué ve tu cliente, y cómo llega la
          información limpia a tu panel.
        </p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Stepper */}
        <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
          {STEPS.map((s, index) => {
            const Icon = s.icon;
            const isActive = index === active;
            const isDone = index < active;
            return (
              <button
                key={s.title}
                type="button"
                onClick={() => setActive(index)}
                className={cn(
                  "flex shrink-0 items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors lg:shrink",
                  isActive
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-accent",
                )}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    isActive
                      ? "bg-gradient-to-br from-brand-violet to-brand-pink text-white"
                      : isDone
                        ? "bg-success/15 text-success"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {isDone ? <Check className="size-4" /> : index + 1}
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-sm font-semibold whitespace-nowrap lg:whitespace-normal">
                    <Icon className="hidden size-3.5 shrink-0 text-muted-foreground sm:inline lg:hidden" />
                    {s.title}
                  </span>
                  <span className="hidden text-xs text-muted-foreground lg:block">
                    {s.summary}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Detail panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-7"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <step.icon className="size-5" />
              </span>
              <div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.summary}</p>
              </div>
            </div>

            {step.details && (
              <ul className="mt-5 space-y-3">
                {step.details.map((detail, i) => (
                  <li key={i} className="flex gap-2.5 text-sm">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                      {i + 1}
                    </span>
                    <span className="text-foreground/90">{detail}</span>
                  </li>
                ))}
              </ul>
            )}

            {step.fields && (
              <div className="mt-5 space-y-3">
                {step.fields.map((field) => (
                  <div
                    key={field.label}
                    className="rounded-xl border border-border bg-muted/30 p-4"
                  >
                    <p className="text-sm font-semibold">{field.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {field.hint}
                    </p>
                    <div className="mt-2.5 flex items-start gap-1.5 rounded-lg border border-dashed border-border bg-card px-3 py-2 text-xs text-muted-foreground">
                      {field.label.toLowerCase().includes("voz") ||
                      field.label.toLowerCase().includes("archivo") ? (
                        <Mic className="mt-0.5 size-3 shrink-0" />
                      ) : field.label.toLowerCase().includes("correo") ? (
                        <Mail className="mt-0.5 size-3 shrink-0" />
                      ) : (
                        <span className="mt-0.5 shrink-0 font-mono text-[10px]">
                          Ej.
                        </span>
                      )}
                      <span className="italic">{field.example}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
