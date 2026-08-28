import type { BriefNiche, PlanType } from "@/types/database";

export const APP_NAME = "BriefFast";

// `||` (not `??`) on purpose: on some platforms an unset env var arrives as
// an empty string rather than undefined, which `??` would not catch.
// Trailing slash stripped so `${APP_URL}/path` never produces a double slash
// (e.g. a trailing-slash NEXT_PUBLIC_APP_URL broke Supabase's redirect_to
// allowlist match on signup).
export const APP_URL = (
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
).replace(/\/+$/, "");

export const NICHE_LABELS: Record<BriefNiche, string> = {
  web_design: "Diseño Web",
  copywriting: "Copywriting",
  branding: "Branding",
  video: "Video / Reels",
};

export const NICHE_ICONS: Record<BriefNiche, string> = {
  web_design: "LayoutTemplate",
  copywriting: "PenLine",
  branding: "Palette",
  video: "Clapperboard",
};

/** Color de acento por nicho — le da variedad visual al grid de plantillas
 * y al simulador en vez de que todo dependa del mismo tono índigo. */
export const NICHE_ACCENT: Record<
  BriefNiche,
  { bg: string; text: string; ring: string; hoverText: string }
> = {
  web_design: {
    bg: "bg-brand-violet/12",
    text: "text-brand-violet",
    ring: "group-hover:border-brand-violet/40",
    hoverText: "group-hover:text-brand-violet",
  },
  copywriting: {
    bg: "bg-brand-orange/12",
    text: "text-brand-orange",
    ring: "group-hover:border-brand-orange/40",
    hoverText: "group-hover:text-brand-orange",
  },
  branding: {
    bg: "bg-brand-pink/12",
    text: "text-brand-pink",
    ring: "group-hover:border-brand-pink/40",
    hoverText: "group-hover:text-brand-pink",
  },
  video: {
    bg: "bg-brand-teal/12",
    text: "text-brand-teal",
    ring: "group-hover:border-brand-teal/40",
    hoverText: "group-hover:text-brand-teal",
  },
};

export const PLAN_LABELS: Record<PlanType, string> = {
  free: "Free",
  pro: "Pro",
  lifetime: "Lifetime",
};

export const FREE_PLAN_ACTIVE_BRIEFS_LIMIT = 2;

export interface Testimonial {
  name: string;
  role: string;
  quote: string;
  avatarSeed: number;
  accent: "violet" | "orange" | "pink" | "teal" | "blue" | "amber";
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Camila Ríos",
    role: "Diseñadora web freelance",
    quote:
      "Antes perdía media hora por cliente tratando de entender qué querían. Ahora mando el link, esperan el brief y ya sé exactamente por dónde empezar.",
    avatarSeed: 47,
    accent: "violet",
  },
  {
    name: "Diego Martín",
    role: "Copywriter · Estudio DM",
    quote:
      "Mis clientes responden desde el celular sin drama y a mí me llega todo ya ordenado: tono, objetivo, deadline. Se siente muy profesional.",
    avatarSeed: 12,
    accent: "orange",
  },
  {
    name: "Valentina Cruz",
    role: "Agencia de branding boutique",
    quote:
      "El resumen que genera la IA es mejor que el que yo escribía a mano. Y el Lifetime Deal se pagó solo con el primer proyecto.",
    avatarSeed: 65,
    accent: "pink",
  },
  {
    name: "Andrés Poveda",
    role: "Editor de video / Reels",
    quote:
      "Uso la plantilla de video con cada cliente nuevo. Lo que más me gusta es que no tengo que perseguir a nadie por WhatsApp para que me responda.",
    avatarSeed: 33,
    accent: "teal",
  },
];

export interface StatItem {
  value: string;
  label: string;
  accent: "violet" | "orange" | "pink" | "teal";
}

export const STATS: StatItem[] = [
  { value: "10s", label: "para previsualizar un brief", accent: "violet" },
  { value: "4", label: "plantillas listas por nicho", accent: "orange" },
  { value: "2 min", label: "promedio para crear un formulario", accent: "pink" },
  { value: "100%", label: "mobile-first para tus clientes", accent: "teal" },
];

export const PRICING_PLANS = [
  {
    id: "free" as const,
    name: "Free",
    price: "$0",
    period: "para siempre",
    description: "Ideal para probar BriefFast en tus primeros proyectos.",
    features: [
      "Hasta 2 briefs activos/mes",
      "Formulario público ilimitado de respuestas",
      "Resumen ejecutivo generado por IA",
      "Exportar a Markdown",
    ],
    cta: "Empezar gratis",
    highlighted: false,
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: "$12",
    period: "/mes",
    description: "Para freelancers y agencias boutique con clientes activos.",
    features: [
      "Briefs ilimitados",
      "Personalización de marca (logo y color)",
      "Presupuestos automáticos con tu tarifario",
      "Exportación a PDF y Notion",
      "Plantillas premium por nicho",
      "Soporte prioritario",
    ],
    cta: "Empezar prueba Pro",
    highlighted: true,
  },
  {
    id: "lifetime" as const,
    name: "Lifetime Deal",
    price: "$49",
    period: "pago único",
    description: "Acceso Pro de por vida. Oferta limitada a 100 usuarios.",
    features: [
      "Todo lo de Pro, para siempre",
      "Sin pagos recurrentes",
      "Acceso a nuevas funciones incluido",
      "Badge de fundador en tu perfil",
    ],
    cta: "Obtener Lifetime Deal",
    highlighted: false,
    badge: "Solo 100 cupos",
  },
];
