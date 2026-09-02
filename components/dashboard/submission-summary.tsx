"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarClock,
  CheckCircle2,
  Clipboard,
  Download,
  FileDown,
  FileSignature,
  FileText,
  Image as ImageIcon,
  Loader2,
  Mic,
  Notebook,
  Paperclip,
  RefreshCw,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EXTRA_NOTES_ANSWER_KEY } from "@/lib/constants";
import type { AiSummary, AttachmentKind, BriefQuestion, SubmissionAttachment } from "@/types/database";

const ATTACHMENT_ICONS: Record<AttachmentKind, typeof Mic> = {
  audio: Mic,
  pdf: FileText,
  image: ImageIcon,
  file: Paperclip,
};

interface Props {
  submissionId: string;
  clientName: string | null;
  clientEmail: string | null;
  questions: BriefQuestion[];
  answers: Record<string, string>;
  initialSummary: AiSummary | null;
  initialMarkdown: string | null;
  attachments: (SubmissionAttachment & { url: string | null })[];
}

export function SubmissionSummary({
  submissionId,
  clientName,
  clientEmail,
  questions,
  answers,
  initialSummary,
  initialMarkdown,
  attachments,
}: Props) {
  const [summary, setSummary] = useState(initialSummary);
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [generating, setGenerating] = useState(false);
  const [exportingNotion, setExportingNotion] = useState(false);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al generar el resumen");
      setSummary(data.summary);
      setMarkdown(data.markdown);
      toast.success("Resumen generado con IA");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al generar el resumen");
    } finally {
      setGenerating(false);
    }
  }

  async function handleCopy() {
    if (!markdown) return;
    await navigator.clipboard.writeText(markdown);
    toast.success("Texto copiado al portapapeles");
  }

  async function handleExportNotion() {
    setExportingNotion(true);
    try {
      const res = await fetch(`/api/submissions/${submissionId}/export-notion`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo exportar a Notion");
      window.open(data.url, "_blank", "noreferrer");
      toast.success("Exportado a Notion");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo exportar a Notion");
    } finally {
      setExportingNotion(false);
    }
  }

  function handleDownloadMarkdown() {
    if (!markdown) return;
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `brief-${submissionId}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4 text-primary" />
            Resumen ejecutivo (IA)
          </CardTitle>
          <Button size="sm" variant="outline" onClick={handleGenerate} disabled={generating}>
            {generating ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <RefreshCw className="size-3.5" />
            )}
            {summary ? "Regenerar" : "Generar con IA"}
          </Button>
        </CardHeader>
        <CardContent className="pb-6">
          {summary ? (
            <div className="space-y-4">
              <p className="rounded-lg bg-accent/50 p-3.5 text-sm leading-relaxed text-accent-foreground">
                {summary.executive_summary}
              </p>

              <SummaryField icon={Target} label="Objetivo" value={summary.objective} />
              <SummaryField
                icon={CheckCircle2}
                label="Entregables"
                value={
                  <ul className="list-inside list-disc space-y-1">
                    {summary.deliverables.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                }
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <SummaryField icon={CalendarClock} label="Deadline" value={summary.deadline ?? "No especificado"} />
                <SummaryField icon={Users} label="Audiencia" value={summary.target_audience ?? "No especificado"} />
              </div>
              <SummaryField label="Tono / voz de marca" value={summary.tone} />
              <SummaryField
                icon={ImageIcon}
                label="Assets necesarios"
                value={
                  <ul className="list-inside list-disc space-y-1">
                    {summary.assets_needed.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                }
              />
              {summary.key_risks && summary.key_risks.length > 0 && (
                <SummaryField
                  label="Riesgos / puntos de atención"
                  value={
                    <ul className="list-inside list-disc space-y-1">
                      {summary.key_risks.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  }
                />
              )}

              <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                <Button size="sm" variant="outline" onClick={handleCopy}>
                  <Clipboard className="size-3.5" />
                  Copiar texto
                </Button>
                <Button size="sm" variant="outline" onClick={handleDownloadMarkdown}>
                  <FileDown className="size-3.5" />
                  Exportar Markdown
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <a href={`/api/submissions/${submissionId}/export-pdf`} target="_blank" rel="noreferrer">
                    <Download className="size-3.5" />
                    Descargar PDF
                  </a>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/dashboard/proposals/new?submissionId=${submissionId}`}>
                    <FileSignature className="size-3.5" />
                    Crear propuesta
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleExportNotion}
                  disabled={exportingNotion}
                >
                  {exportingNotion ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Notebook className="size-3.5" />
                  )}
                  Exportar a Notion
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Aún no se ha generado un resumen con IA para esta respuesta.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Respuestas originales del cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pb-6">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Contacto</p>
            <p className="text-sm">
              {clientName} · {clientEmail}
            </p>
          </div>
          {questions.map((q) => (
            <div key={q.id}>
              <p className="text-xs font-medium text-muted-foreground">{q.label}</p>
              <p className="text-sm whitespace-pre-wrap">{answers[q.id]?.trim() || "—"}</p>
            </div>
          ))}
          {answers[EXTRA_NOTES_ANSWER_KEY]?.trim() && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Notas adicionales del cliente
              </p>
              <p className="text-sm whitespace-pre-wrap">
                {answers[EXTRA_NOTES_ANSWER_KEY]}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {attachments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Adjuntos del cliente ({attachments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pb-6">
            {attachments.map((a) => {
              const Icon = ATTACHMENT_ICONS[a.kind];
              return (
                <div key={a.id} className="rounded-lg border border-border p-3.5">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Icon className="size-4 text-muted-foreground" />
                    {a.original_filename ?? "Adjunto"}
                  </div>
                  {a.kind === "audio" && a.url && (
                    <audio controls src={a.url} className="mt-2 w-full" />
                  )}
                  {a.kind === "audio" && a.transcript && (
                    <p className="mt-2 rounded-md bg-muted/50 p-2.5 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Transcripción: </span>
                      {a.transcript}
                    </p>
                  )}
                  {a.kind !== "audio" && a.url && (
                    <Button size="sm" variant="outline" className="mt-2" asChild>
                      <a href={a.url} target="_blank" rel="noreferrer">
                        <Download className="size-3.5" />
                        Ver archivo
                      </a>
                    </Button>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SummaryField({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof Target;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex gap-2.5">
      {Icon && (
        <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
          <Icon className="size-3.5" />
        </div>
      )}
      <div className={Icon ? "" : "pl-8"}>
        <p className="text-xs font-semibold">{label}</p>
        <div className="text-sm text-muted-foreground">{value}</div>
      </div>
    </div>
  );
}
