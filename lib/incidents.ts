import { z } from "zod";

import type { IncidentPriority, IncidentType } from "@/types/database";

export const INCIDENT_PRIORITIES: IncidentPriority[] = ["Baja", "Media", "Alta", "Crítica"];
export const INCIDENT_TYPES: IncidentType[] = ["Error", "Bug", "Petición", "Soporte técnico"];

export const PRIORITY_BADGE_VARIANT: Record<
  IncidentPriority,
  "secondary" | "warning" | "destructive"
> = {
  Baja: "secondary",
  Media: "secondary",
  Alta: "warning",
  Crítica: "destructive",
};

export const AUDIO_EXTENSIONS = [".ogg", ".mp3", ".m4a", ".wav"];
export const AUDIO_MIME_TYPES = [
  "audio/ogg",
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/x-m4a",
  "audio/m4a",
  "audio/wav",
  "audio/x-wav",
  "audio/webm",
];
export const MAX_AUDIO_SIZE_BYTES = 25 * 1024 * 1024;

/**
 * Quita el ruido típico de un chat exportado de WhatsApp (marcas de tiempo y
 * remitente al inicio de cada línea, mensajes de sistema) antes de pasarle el
 * texto a Claude — reduce tokens y evita que el modelo confunda un nombre de
 * remitente con un dato de contacto real del cliente.
 */
export function cleanWhatsappNoise(rawText: string): string {
  return rawText
    .split("\n")
    .map((line) =>
      line
        // "12/08/2024, 10:32 - Juan Pérez: mensaje" / "[12/08/24, 10:32:01] Juan Pérez: mensaje"
        .replace(
          /^\[?\d{1,2}\/\d{1,2}\/\d{2,4},?\s+\d{1,2}:\d{2}(:\d{2})?\s?(a\.?\s?m\.?|p\.?\s?m\.?)?\]?\s*-?\s*([^:]{1,40}:)?\s*/i,
          "",
        )
        .trim(),
    )
    .filter((line) => line.length > 0 && !/^(?:<Multimedia omitido>|image omitted|audio omitted)$/i.test(line))
    .join("\n")
    .trim();
}

export function isAllowedAudioFile(file: { name: string; type: string }): boolean {
  const lowerName = file.name.toLowerCase();
  const hasAllowedExtension = AUDIO_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
  const hasAllowedMime = AUDIO_MIME_TYPES.includes(file.type);
  return hasAllowedExtension || hasAllowedMime;
}

export const incidentContactSchema = z.object({
  nombre: z.string().nullable(),
  email: z.string().nullable(),
  telefono: z.string().nullable(),
});

export const incidentBriefSchema = z.object({
  titulo_corto: z.string().min(1),
  prioridad: z.enum(["Baja", "Media", "Alta", "Crítica"]),
  tipo: z.enum(["Error", "Bug", "Petición", "Soporte técnico"]),
  descripcion_problema: z.string().min(1),
  pasos_para_reproducir: z.array(z.string()),
  datos_contacto_cliente: incidentContactSchema,
  acciones_sugeridas: z.array(z.string()),
});
