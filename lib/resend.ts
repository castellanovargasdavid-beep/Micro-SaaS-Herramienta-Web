import { Resend } from "resend";

import { APP_NAME, APP_URL } from "@/lib/constants";

let _resend: Resend | null = null;

/**
 * Instancia perezosa por el mismo motivo que lib/stripe.ts: si se creara a
 * nivel de módulo, Next.js la inicializaría al importar durante `next
 * build`, y el SDK lanza una excepción si RESEND_API_KEY no está definida
 * todavía en esa etapa.
 */
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const EMAIL_FROM = `${APP_NAME} <notificaciones@briefquick.com>`;

/**
 * El SDK de Resend NO lanza una excepción cuando el envío falla del lado de
 * su API (dominio no verificado, from inválido, etc.) — devuelve
 * `{ data, error }` con la petición HTTP en 200. Si no revisamos `error` a
 * mano, un fallo real queda completamente silencioso: no rompe nada, pero
 * tampoco se envía el correo ni queda rastro en los logs.
 */
async function sendEmail(payload: Parameters<Resend["emails"]["send"]>[0]) {
  const { error } = await getResend().emails.send(payload);
  if (error) {
    throw new Error(`Resend rechazó el envío: ${error.name} — ${error.message}`);
  }
}

/**
 * Aviso al dueño del brief (el freelancer) cuando un cliente termina de
 * responder — llega a su correo de la cuenta, que normalmente es su Gmail.
 * Igual que la generación del resumen con IA, un fallo aquí no debe romper
 * el envío del formulario del cliente: el llamador debe envolverlo en un
 * try/catch propio.
 */
export async function sendNewSubmissionEmail(input: {
  to: string;
  briefId: string;
  briefTitle: string;
  submissionId: string;
  clientName: string;
}) {
  const url = `${APP_URL}/dashboard/briefs/${input.briefId}/submissions/${input.submissionId}`;

  await sendEmail({
    from: EMAIL_FROM,
    to: input.to,
    subject: `Nueva respuesta de ${input.clientName} en "${input.briefTitle}"`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <p><strong>${input.clientName}</strong> acaba de responder tu brief <strong>${input.briefTitle}</strong>.</p>
        <p style="margin: 24px 0;">
          <a href="${url}" style="background: #6d28d9; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Ver respuesta completa
          </a>
        </p>
        <p style="color: #6b7280; font-size: 13px;">${APP_NAME}</p>
      </div>
    `,
  });
}

/** Confirmación al cliente final de que su respuesta llegó correctamente. */
export async function sendSubmissionConfirmationEmail(input: {
  to: string;
  clientName: string;
  briefTitle: string;
}) {
  const firstName = input.clientName.split(" ")[0];

  await sendEmail({
    from: EMAIL_FROM,
    to: input.to,
    subject: `Recibimos tu respuesta para "${input.briefTitle}"`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <p>Hola ${firstName},</p>
        <p>Confirmamos que tu respuesta para <strong>${input.briefTitle}</strong> se envió correctamente. Te contactarán pronto con los siguientes pasos.</p>
        <p style="color: #6b7280; font-size: 13px; margin-top: 24px;">${APP_NAME}</p>
      </div>
    `,
  });
}
