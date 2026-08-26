import { createAdminClient } from "@/lib/supabase/admin";

export const ATTACHMENTS_BUCKET = "attachments";

/**
 * URL firmada de corta duración para reproducir/descargar un adjunto desde el
 * dashboard. El bucket es privado; quien llama esta función ya debe haber
 * verificado que el usuario autenticado es dueño del brief (ver RLS de
 * submission_attachments + el join explícito en la página que la usa).
 */
export async function getAttachmentSignedUrl(
  storagePath: string,
  expiresInSeconds = 3600,
): Promise<string | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(ATTACHMENTS_BUCKET)
    .createSignedUrl(storagePath, expiresInSeconds);

  if (error || !data) return null;
  return data.signedUrl;
}
