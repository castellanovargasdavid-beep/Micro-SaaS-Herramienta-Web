import type { Metadata } from "next";

import { LegalLayout } from "@/components/landing/legal-layout";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = { title: "Política de privacidad" };

export default function PrivacyPage() {
  return (
    <LegalLayout title="Política de privacidad" updatedAt="23 de agosto de 2026">
      <p>
        Esta política explica qué datos recopila {APP_NAME} y cómo los
        utilizamos.
      </p>

      <h2 className="text-lg font-semibold text-foreground">1. Datos que recopilamos</h2>
      <p>
        Datos de cuenta (nombre, correo electrónico) al registrarte; datos de
        los briefs que crees; y las respuestas que los clientes finales
        envían a través de tus formularios públicos (nombre, correo y
        respuestas del formulario).
      </p>

      <h2 className="text-lg font-semibold text-foreground">2. Uso de la IA</h2>
      <p>
        Las respuestas de tus formularios se envían a la API de Anthropic
        (Claude) únicamente para generar el resumen ejecutivo de tu brief.
        No se utilizan para entrenar modelos de terceros.
      </p>

      <h2 className="text-lg font-semibold text-foreground">3. Almacenamiento</h2>
      <p>
        Los datos se almacenan en Supabase (PostgreSQL) con políticas de
        seguridad a nivel de fila (Row Level Security), de forma que cada
        usuario solo puede acceder a sus propios briefs y respuestas.
      </p>

      <h2 className="text-lg font-semibold text-foreground">4. Pagos</h2>
      <p>
        El procesamiento de pagos lo realiza Stripe. {APP_NAME} no almacena
        números de tarjeta ni datos financieros completos en sus propios
        servidores.
      </p>

      <h2 className="text-lg font-semibold text-foreground">5. Tus derechos</h2>
      <p>
        Puedes solicitar la exportación o eliminación de tus datos personales
        y los de tu cuenta escribiendo a{" "}
        <a className="underline" href="mailto:hola@brieffast.app">
          hola@brieffast.app
        </a>
        .
      </p>
    </LegalLayout>
  );
}
