import type { Metadata } from "next";

import { LegalLayout } from "@/components/landing/legal-layout";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = { title: "Términos de servicio" };

export default function TermsPage() {
  return (
    <LegalLayout title="Términos de servicio" updatedAt="23 de agosto de 2026">
      <p>
        Estos Términos de Servicio (&ldquo;Términos&rdquo;) regulan el uso de{" "}
        {APP_NAME} (el &ldquo;Servicio&rdquo;), operado por el equipo de{" "}
        {APP_NAME}. Al crear una cuenta o utilizar el Servicio, aceptas estos
        Términos.
      </p>

      <h2 className="text-lg font-semibold text-foreground">1. Descripción del servicio</h2>
      <p>
        {APP_NAME} permite crear formularios (&ldquo;briefs&rdquo;) para recopilar
        requerimientos de clientes y generar, mediante inteligencia
        artificial, un resumen ejecutivo estructurado a partir de esas
        respuestas.
      </p>

      <h2 className="text-lg font-semibold text-foreground">2. Cuentas y planes</h2>
      <p>
        Ofrecemos un plan gratuito con un límite de 2 briefs activos por mes,
        un plan Pro de suscripción mensual y un plan Lifetime de pago único
        limitado a 100 usuarios. Los precios y límites vigentes se muestran
        en la página de precios y pueden actualizarse con aviso previo
        razonable.
      </p>

      <h2 className="text-lg font-semibold text-foreground">3. Contenido generado por IA</h2>
      <p>
        Los resúmenes generados por IA se ofrecen como punto de partida y
        pueden contener imprecisiones. Eres responsable de revisar y validar
        el contenido antes de compartirlo o actuar en base a él con tus
        clientes.
      </p>

      <h2 className="text-lg font-semibold text-foreground">4. Uso aceptable</h2>
      <p>
        No debes utilizar el Servicio para recopilar datos de forma
        fraudulenta, enviar spam, ni para fines ilegales. Nos reservamos el
        derecho de suspender cuentas que incumplan estos Términos.
      </p>

      <h2 className="text-lg font-semibold text-foreground">5. Cancelación y reembolsos</h2>
      <p>
        Puedes cancelar tu suscripción Pro en cualquier momento; el acceso
        continuará hasta el final del período ya pagado, sin reembolso
        proporcional por el tiempo restante. El plan Lifetime tiene una
        garantía de devolución de 7 días naturales desde la fecha de compra:
        si dentro de ese plazo escribes a{" "}
        <a className="underline" href="mailto:lecastvarg@gmail.com">
          lecastvarg@gmail.com
        </a>{" "}
        solicitando el reembolso, te devolvemos el 100% de lo pagado. Pasado
        ese plazo, el plan Lifetime no es reembolsable.
      </p>

      <h2 className="text-lg font-semibold text-foreground">6. Contacto</h2>
      <p>
        Para consultas sobre estos Términos, escríbenos a{" "}
        <a className="underline" href="mailto:lecastvarg@gmail.com">
          lecastvarg@gmail.com
        </a>
        .
      </p>
    </LegalLayout>
  );
}
