"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Loader2, Mic, Save, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { createIncidentAction } from "@/app/dashboard/incidents/actions";
import {
  briefToEditable,
  IncidentBriefCard,
  type EditableIncidentBrief,
} from "@/components/incidents/incident-brief-card";
import { AudioDropzone } from "@/components/incidents/audio-dropzone";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { IncidentBrief, IncidentSource } from "@/types/database";

interface ChatMessage {
  role: "user" | "bot";
  text: string;
}

export function IncidentChatbot() {
  const [inputMode, setInputMode] = useState<"text" | "audio">("text");
  const [textValue, setTextValue] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draftBrief, setDraftBrief] = useState<EditableIncidentBrief | null>(null);
  const [rawInput, setRawInput] = useState("");
  const [source, setSource] = useState<IncidentSource>("text");
  const [savedId, setSavedId] = useState<string | null>(null);
  const [ingesting, setIngesting] = useState(false);
  const [saving, startSaving] = useTransition();

  const canSubmit = inputMode === "text" ? textValue.trim().length > 0 : audioFile != null;

  async function handleIngest() {
    if (!canSubmit || ingesting) return;

    setSavedId(null);
    setDraftBrief(null);

    const userMessage =
      inputMode === "text"
        ? textValue.trim()
        : `🎤 Nota de audio: ${audioFile?.name}`;
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);

    setIngesting(true);
    try {
      const formData = new FormData();
      if (inputMode === "text") {
        formData.set("text", textValue.trim());
      } else if (audioFile) {
        formData.set("audio", audioFile);
      }

      const res = await fetch("/api/incidents/ingest", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "bot", text: data.error ?? "No se pudo procesar la incidencia." },
        ]);
        toast.error(data.error ?? "No se pudo procesar la incidencia.");
        return;
      }

      const brief = data.brief as IncidentBrief;
      setDraftBrief(briefToEditable(brief));
      setRawInput(data.rawText as string);
      setSource(data.source as IncidentSource);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text:
            data.source === "audio"
              ? `Transcripción: "${data.rawText}"`
              : "Aquí tienes el brief de incidencia. Revísalo y ajusta lo que haga falta antes de guardar.",
        },
      ]);

      setTextValue("");
      setAudioFile(null);
    } catch {
      toast.error("No se pudo conectar con el asistente. Intenta de nuevo.");
    } finally {
      setIngesting(false);
    }
  }

  function handleSave() {
    if (!draftBrief) return;
    startSaving(async () => {
      const result = await createIncidentAction({
        title: draftBrief.title,
        priority: draftBrief.priority,
        type: draftBrief.type,
        description: draftBrief.description,
        reproSteps: draftBrief.reproSteps,
        contactName: draftBrief.contactName,
        contactEmail: draftBrief.contactEmail,
        contactPhone: draftBrief.contactPhone,
        suggestedActions: draftBrief.suggestedActions,
        rawInput,
        source,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      setSavedId(result.id ?? null);
      toast.success("Incidencia guardada");
    });
  }

  return (
    <div className="space-y-5">
      {messages.length > 0 && (
        <div className="space-y-3 rounded-2xl border border-border bg-muted/20 p-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={
                m.role === "user"
                  ? "ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-3.5 py-2 text-sm text-primary-foreground"
                  : "mr-auto flex max-w-[90%] items-start gap-2 rounded-2xl rounded-tl-sm bg-card px-3.5 py-2 text-sm shadow-sm"
              }
            >
              {m.role === "bot" && <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />}
              <span className="whitespace-pre-line">{m.text}</span>
            </div>
          ))}
        </div>
      )}

      {draftBrief && !savedId && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" />
            Brief de incidencia generado por IA
          </div>
          <IncidentBriefCard value={draftBrief} onChange={setDraftBrief} />
          <Button className="mt-5" variant="gradient" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Guardar incidencia
          </Button>
        </div>
      )}

      {savedId && (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-success/30 bg-success/5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="size-4 shrink-0 text-success" />
            Incidencia guardada correctamente.
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/incidents/${savedId}`}>Ver incidencia</Link>
          </Button>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as "text" | "audio")}>
          <TabsList>
            <TabsTrigger value="text">Pegar texto</TabsTrigger>
            <TabsTrigger value="audio">
              <Mic className="size-3.5" />
              Nota de audio
            </TabsTrigger>
          </TabsList>
          <TabsContent value="text" className="mt-3">
            <Textarea
              rows={5}
              placeholder={`Pega aquí la captura del chat de WhatsApp del cliente, por ejemplo:\n\n12/08/24, 10:32 - María: hola! la app se cierra sola cuando intento subir una foto de perfil, me pasa desde ayer y ya no puedo usarla, urgente porfa`}
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              disabled={ingesting}
            />
          </TabsContent>
          <TabsContent value="audio" className="mt-3">
            <AudioDropzone file={audioFile} onChange={setAudioFile} disabled={ingesting} />
          </TabsContent>
        </Tabs>

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <AlertTriangle className="size-3.5" />
            Revisa siempre el brief generado antes de guardarlo.
          </p>
          <Button onClick={handleIngest} disabled={!canSubmit || ingesting} variant="gradient">
            {ingesting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            {ingesting
              ? inputMode === "audio"
                ? "Transcribiendo…"
                : "Analizando…"
              : "Enviar al asistente"}
          </Button>
        </div>
      </div>
    </div>
  );
}
