import type { BriefNiche, PlanType } from "@/types/database";

export const APP_NAME = "BriefFast";

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

export const PLAN_LABELS: Record<PlanType, string> = {
  free: "Free",
  pro: "Pro",
  lifetime: "Lifetime",
};

export const FREE_PLAN_ACTIVE_BRIEFS_LIMIT = 2;

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
