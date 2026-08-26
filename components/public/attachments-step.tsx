"use client";

import { useRef, useState } from "react";
import {
  FileText,
  Image as ImageIcon,
  Loader2,
  Mic,
  Paperclip,
  Square,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ATTACHMENTS_BUCKET } from "@/lib/supabase/storage";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { AttachmentKind } from "@/types/database";

export interface PendingAttachment {
  kind: AttachmentKind;
  storagePath: string;
  originalFilename: string | null;
}

function kindFromMimeType(mimeType: string): AttachmentKind {
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.startsWith("image/")) return "image";
  return "file";
}

const ICONS: Record<AttachmentKind, typeof Mic> = {
  audio: Mic,
  pdf: FileText,
  image: ImageIcon,
  file: Paperclip,
};

export function AttachmentsStep({
  value,
  onChange,
}: {
  value: PendingAttachment[];
  onChange: (next: PendingAttachment[]) => void;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function uploadBlob(blob: Blob, filename: string, kind: AttachmentKind) {
    setUploading(true);
    try {
      const supabase = createClient();
      const path = `public/${crypto.randomUUID()}-${filename}`;
      const { error } = await supabase.storage
        .from(ATTACHMENTS_BUCKET)
        .upload(path, blob, { contentType: blob.type || undefined });

      if (error) throw error;

      onChange([...value, { kind, storagePath: path, originalFilename: filename }]);
    } catch {
      toast.error("No se pudo subir el archivo. Intenta de nuevo.");
    } finally {
      setUploading(false);
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        void uploadBlob(blob, `nota-de-voz-${Date.now()}.webm`, "audio");
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      toast.error("No se pudo acceder al micrófono. Revisa los permisos del navegador.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    for (const file of files) {
      void uploadBlob(file, file.name, kindFromMimeType(file.type));
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeAttachment(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-dashed border-border p-4">
        <p className="text-xs font-medium text-muted-foreground">
          Nota de voz (opcional)
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Grábala como en WhatsApp — la IA la transcribe automáticamente.
        </p>
        <div className="mt-3">
          {isRecording ? (
            <Button type="button" variant="destructive" size="sm" onClick={stopRecording}>
              <Square className="size-3.5" />
              Detener ({mm}:{ss})
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={startRecording}
              disabled={uploading}
            >
              <Mic className="size-3.5" />
              Grabar nota de voz
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-border p-4">
        <p className="text-xs font-medium text-muted-foreground">
          Adjuntar PDF, imagen o audio (opcional)
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Cotizaciones previas, referencias visuales, o una nota de voz ya
          grabada.
        </p>
        <div className="mt-3">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,image/*,audio/*"
            onChange={handleFileChange}
            className="hidden"
            id="attachment-file-input"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Paperclip className="size-3.5" />
            )}
            Elegir archivo
          </Button>
        </div>
      </div>

      {value.length > 0 && (
        <ul className="space-y-1.5">
          {value.map((a, i) => {
            const Icon = ICONS[a.kind];
            return (
              <li
                key={a.storagePath}
                className={cn(
                  "flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm",
                )}
              >
                <Icon className="size-4 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate">{a.originalFilename}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(i)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
