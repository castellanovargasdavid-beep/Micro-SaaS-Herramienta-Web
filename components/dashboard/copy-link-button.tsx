"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Enlace copiado al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("No se pudo copiar el enlace");
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? "Copiado" : "Copiar enlace"}
    </Button>
  );
}
