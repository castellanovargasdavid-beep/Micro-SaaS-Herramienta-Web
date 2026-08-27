"use client";

import { useRef, useState } from "react";
import { Mic, Trash2, UploadCloud } from "lucide-react";

import { AUDIO_EXTENSIONS, isAllowedAudioFile } from "@/lib/incidents";
import { cn } from "@/lib/utils";

export function AudioDropzone({
  file,
  onChange,
  disabled,
}: {
  file: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  function acceptFile(candidate: File) {
    if (!isAllowedAudioFile(candidate)) {
      setError(`Formato no soportado. Usa ${AUDIO_EXTENSIONS.join(", ")}.`);
      return;
    }
    setError(null);
    onChange(candidate);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) acceptFile(dropped);
  }

  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
        <Mic className="size-4 shrink-0 text-primary" />
        <span className="flex-1 truncate text-sm font-medium">{file.name}</span>
        <button
          type="button"
          onClick={() => onChange(null)}
          disabled={disabled}
          className="shrink-0 text-muted-foreground hover:text-destructive"
          aria-label="Quitar audio"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label="Arrastra un audio aquí o haz clic para seleccionarlo"
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <UploadCloud className="size-6 text-muted-foreground" />
        <p className="text-sm font-medium">Arrastra una nota de audio aquí</p>
        <p className="text-xs text-muted-foreground">
          o haz clic para elegir un archivo · {AUDIO_EXTENSIONS.join(", ")}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={AUDIO_EXTENSIONS.join(",")}
          className="hidden"
          disabled={disabled}
          onChange={(e) => {
            const selected = e.target.files?.[0];
            if (selected) acceptFile(selected);
            e.target.value = "";
          }}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}
