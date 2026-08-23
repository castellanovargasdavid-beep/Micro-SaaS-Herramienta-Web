import Link from "next/link";
import {
  ArrowUpRight,
  Clapperboard,
  LayoutTemplate,
  Palette,
  PenLine,
} from "lucide-react";

import { NICHE_LABELS } from "@/lib/constants";
import type { BriefNiche } from "@/types/database";

const TEMPLATES: {
  niche: BriefNiche;
  icon: typeof LayoutTemplate;
  description: string;
  questions: number;
}[] = [
  {
    niche: "web_design",
    icon: LayoutTemplate,
    description:
      "Objetivo del sitio, páginas necesarias, referencias visuales y presupuesto.",
    questions: 7,
  },
  {
    niche: "copywriting",
    icon: PenLine,
    description:
      "Audiencia, tono de voz, formato de contenido y palabras clave a incluir.",
    questions: 7,
  },
  {
    niche: "branding",
    icon: Palette,
    description:
      "Valores de marca, competencia, colores preferidos y entregables esperados.",
    questions: 7,
  },
  {
    niche: "video",
    icon: Clapperboard,
    description:
      "Plataforma de destino, duración, guion existente y referencias de estilo.",
    questions: 7,
  },
];

export function TemplatesGrid() {
  return (
    <section id="plantillas" className="bg-muted/30 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-primary">
            Plantillas por nicho
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Empieza con preguntas ya pensadas para tu especialidad
          </h2>
          <p className="mt-4 text-muted-foreground">
            Cada plantilla trae las preguntas correctas para ese tipo de
            proyecto. Personalízalas o úsalas tal cual.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TEMPLATES.map(({ niche, icon: Icon, description, questions }) => (
            <Link
              key={niche}
              href={`/signup?template=${niche}`}
              className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
              <h3 className="mt-4 font-semibold">{NICHE_LABELS[niche]}</h3>
              <p className="mt-1.5 flex-1 text-sm text-muted-foreground">
                {description}
              </p>
              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {questions} preguntas incluidas
                </span>
                <ArrowUpRight className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
