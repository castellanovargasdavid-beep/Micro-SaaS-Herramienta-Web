import type { AiSummary, BriefNiche } from "@/types/database";

export interface DemoSample {
  niche: BriefNiche;
  chaoticMessage: string;
  summary: AiSummary;
}

/**
 * El simulador de la landing es 100% client-side e ilustrativo: no consume la
 * API de Anthropic (evita exponer costo/abuso a tráfico anónimo). El flujo
 * real y autenticado (formulario público -> /api/generate-summary) sí llama
 * a Claude de verdad. Ver README para más contexto de esta decisión.
 */
export const DEMO_SAMPLES: Record<BriefNiche, DemoSample> = {
  web_design: {
    niche: "web_design",
    chaoticMessage:
      "Holaa! necesito una pagina para mi negocio de reposteria, algo bonito " +
      "y que se vea profesional, tengo fotos de mis tortas en el celular te " +
      "las paso luego. Quiero que la gente pueda ver el menu y contactarme " +
      "por whatsapp. Ah y que sea rapido porque tengo un evento en 3 semanas! " +
      "presupuesto no muy alto porque recien empiezo jaja",
    summary: {
      objective:
        "Crear un sitio web profesional para un negocio de repostería que muestre el catálogo de productos y facilite el contacto directo vía WhatsApp.",
      deliverables: [
        "Landing page de una sola página (menú, galería, contacto)",
        "Integración de botón flotante de WhatsApp",
        "Galería de fotos de productos (a entregar por la clienta)",
        "Versión responsive optimizada para móvil",
      ],
      tone: "Cercano, cálido y profesional — refleja artesanía y calidad casera.",
      deadline: "3 semanas (evento próximo, prioridad alta)",
      assets_needed: [
        "Fotografías de productos en alta resolución",
        "Logotipo (si existe) o nombre del negocio para wordmark",
        "Número de WhatsApp de contacto",
      ],
      target_audience: "Clientes locales buscando pasteles y postres personalizados.",
      budget_notes: "Presupuesto ajustado — cliente en etapa inicial del negocio.",
      key_risks: [
        "Timeline ajustado de 3 semanas requiere confirmar contenidos (fotos) desde el día 1",
      ],
      executive_summary:
        "Sitio de una página, cálido y funcional, enfocado en conversión directa a WhatsApp, con entrega en 3 semanas y presupuesto reducido.",
    },
  },
  copywriting: {
    niche: "copywriting",
    chaoticMessage:
      "necesito textos para mi tienda online de ropa deportiva, algo que " +
      "venda pero que no suene como vendedor de crema jaja, es para gente " +
      "joven que hace ejercicio, quiero para la pagina principal y como 5 " +
      "descripciones de productos, para la otra semana si se puede",
    summary: {
      objective:
        "Redactar copy persuasivo para una tienda online de ropa deportiva orientado a un público joven y activo.",
      deliverables: [
        "Copy de página principal (hero + propuesta de valor)",
        "5 descripciones de producto orientadas a conversión",
      ],
      tone: "Cercano, motivador y auténtico — evitar lenguaje de venta agresiva.",
      deadline: "1 semana",
      assets_needed: [
        "Nombres y características técnicas de los 5 productos",
        "Fotos o referencias de cada prenda",
      ],
      target_audience: "Jóvenes activos que practican deporte con regularidad.",
      budget_notes: "No especificado",
      key_risks: [
        "Falta definir palabras clave / SEO objetivo antes de redactar",
      ],
      executive_summary:
        "Copy motivador y auténtico para home + 5 fichas de producto, con foco en conexión emocional más que en venta directa, entrega en 1 semana.",
    },
  },
  branding: {
    niche: "branding",
    chaoticMessage:
      "Buenas, estamos armando una marca de cafe de especialidad, todavia " +
      "no tenemos nombre definitivo pero la idea es algo minimalista, " +
      "colores tierra, que se vea premium pero no aburrido. Necesitamos " +
      "logo y como que mas cosas? no se bien que se necesita la verdad, " +
      "ustedes son los expertos",
    summary: {
      objective:
        "Desarrollar la identidad de marca completa para un negocio de café de especialidad, aún en etapa de definición de naming.",
      deliverables: [
        "Sesión de naming y validación de nombre de marca",
        "Diseño de logotipo (versión principal + variantes)",
        "Paleta de colores en tonos tierra",
        "Guía básica de uso de marca (tipografía, espaciados, aplicaciones)",
      ],
      tone: "Premium, minimalista y cálido — evitar exceso de elementos decorativos.",
      deadline: "No especificado",
      assets_needed: [
        "Referencias visuales de marcas que le gusten al cliente",
        "Definición de misión/valores del negocio (se recomienda sesión de descubrimiento)",
      ],
      target_audience: "Consumidores de café de especialidad con poder adquisitivo medio-alto.",
      budget_notes: "No especificado",
      key_risks: [
        "El cliente no tiene claro el alcance del proyecto — recomendable agendar llamada de descubrimiento antes de cotizar",
      ],
      executive_summary:
        "Proyecto de branding integral desde cero (naming + identidad visual) en estética minimalista premium; se recomienda una sesión de descubrimiento inicial dado que el cliente aún no define alcance completo.",
    },
  },
  video: {
    niche: "video",
    chaoticMessage:
      "hola! quiero un reel para instagram promocionando mi curso online, " +
      "algo corto y dinamico, tengo clips grabados con el celular pero " +
      "estan medio desordenados, la idea es que se vea profesional. lo " +
      "necesito para el lanzamiento que es en 10 dias",
    summary: {
      objective:
        "Producir un reel promocional para Instagram que anuncie el lanzamiento de un curso online.",
      deliverables: [
        "Edición de reel (15-30 segundos) a partir de clips existentes del cliente",
        "Selección musical/trending sound",
        "Subtítulos y textos dinámicos en pantalla",
        "Exportación en formato vertical optimizado para Instagram",
      ],
      tone: "Dinámico, profesional y enérgico — apto para lanzamiento de producto.",
      deadline: "10 días (fecha de lanzamiento fija)",
      assets_needed: [
        "Clips grabados por el cliente (celular)",
        "Logo o nombre del curso para overlay",
        "Fecha/oferta de lanzamiento para call-to-action final",
      ],
      target_audience: "Seguidores del cliente interesados en el tema del curso.",
      budget_notes: "No especificado",
      key_risks: [
        "Calidad de los clips fuente (grabados con celular, posible material desordenado) puede limitar el resultado final",
      ],
      executive_summary:
        "Reel de lanzamiento dinámico de 15-30s a partir de material existente del cliente, con entrega en 10 días — se recomienda revisar el material fuente cuanto antes por el timeline ajustado.",
    },
  },
};

export function getDemoSample(niche: BriefNiche): DemoSample {
  return DEMO_SAMPLES[niche];
}
