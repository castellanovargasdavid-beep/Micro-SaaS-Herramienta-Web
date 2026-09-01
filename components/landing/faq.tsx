"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const FAQ_ITEMS = [
  {
    question: "¿Mis clientes necesitan crear una cuenta para responder?",
    answer:
      "No. Les compartes un link público a tu formulario y lo llenan directo desde el navegador, sin registro ni contraseña.",
  },
  {
    question: "¿Qué pasa con los datos que mis clientes escriben o graban?",
    answer:
      "Se guardan de forma privada en tu cuenta — solo tú puedes verlos desde tu panel. Las notas de voz y los documentos se procesan únicamente para generar el resumen ejecutivo, nunca se usan para entrenar modelos de terceros.",
  },
  {
    question: "¿Necesito tarjeta de crédito para el plan gratis?",
    answer:
      "No. El plan Free incluye hasta 2 briefs activos por mes sin pedirte ningún dato de pago.",
  },
  {
    question: "¿Puedo cancelar el plan Pro cuando quiera?",
    answer:
      "Sí, sin permanencia. Cancelas cuando quieras y mantienes el acceso hasta el final del período que ya pagaste.",
  },
  {
    question: "Compré el plan Lifetime y no me convenció, ¿qué hago?",
    answer:
      "Tienes 7 días naturales desde la compra para pedir un reembolso completo, sin preguntas. Solo escríbenos.",
  },
  {
    question: "¿Qué tan precisos son los resúmenes que genera la IA?",
    answer:
      "Son un punto de partida sólido a partir de lo que realmente escribió o grabó tu cliente, pero siempre los revisas y editas antes de compartirlos o usarlos para presupuestar — la decisión final es tuya.",
  },
];

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />
      <div className="text-center">
        <span className="text-sm font-semibold uppercase tracking-wide text-brand-teal">
          Preguntas frecuentes
        </span>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Todo lo que necesitas saber antes de empezar
        </h2>
      </div>

      <div className="mt-10 divide-y divide-border rounded-2xl border border-border bg-card">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={item.question}>
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold"
                aria-expanded={isOpen}
              >
                {item.question}
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-muted-foreground transition-transform",
                    isOpen && "rotate-180",
                  )}
                />
              </button>
              {isOpen && (
                <p className="px-5 pb-4 text-sm text-muted-foreground">
                  {item.answer}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
