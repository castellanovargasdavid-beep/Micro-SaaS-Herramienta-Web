"use client";

import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { updateBriefAction } from "@/app/dashboard/briefs/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Brief, BriefQuestion, QuestionType } from "@/types/database";

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  text: "Texto corto",
  textarea: "Texto largo",
  select: "Opción múltiple",
  date: "Fecha",
  email: "Correo",
  url: "URL",
};

function newQuestion(): BriefQuestion {
  return {
    id: crypto.randomUUID(),
    type: "text",
    label: "",
    required: true,
  };
}

export function BriefSettingsForm({ brief }: { brief: Brief }) {
  const [title, setTitle] = useState(brief.title);
  const [introMessage, setIntroMessage] = useState(brief.intro_message ?? "");
  const [brandColor, setBrandColor] = useState(brief.brand_color ?? "#6d28d9");
  const [questions, setQuestions] = useState<BriefQuestion[]>(brief.questions);
  const [isPending, startTransition] = useTransition();

  function updateQuestion(id: string, patch: Partial<BriefQuestion>) {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  }

  function removeQuestion(id: string) {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }

  function moveQuestion(index: number, direction: -1 | 1) {
    setQuestions((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function handleSave() {
    startTransition(async () => {
      const result = await updateBriefAction({
        briefId: brief.id,
        title,
        introMessage,
        brandColor,
        questions,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Cambios guardados");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold">Detalles del brief</h3>
        <div className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="brief-title">Título</Label>
            <Input id="brief-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="brief-intro">Mensaje de bienvenida (opcional)</Label>
            <Textarea
              id="brief-intro"
              value={introMessage}
              onChange={(e) => setIntroMessage(e.target.value)}
              placeholder="Ej: Cuéntanos sobre tu proyecto, esto nos ayudará a preparar la mejor propuesta."
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="brand-color">Color de marca</Label>
            <div className="flex items-center gap-2">
              <input
                id="brand-color"
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="size-10 cursor-pointer rounded-md border border-input"
              />
              <Input
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="max-w-32"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Preguntas del formulario</h3>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setQuestions((prev) => [...prev, newQuestion()])}
          >
            <Plus className="size-3.5" />
            Añadir pregunta
          </Button>
        </div>

        <div className="mt-4 space-y-3">
          {questions.map((q, index) => (
            <div key={q.id} className="rounded-lg border border-border p-3.5">
              <div className="flex items-start gap-2">
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => moveQuestion(index, -1)}
                    disabled={index === 0}
                    className="rounded p-0.5 text-muted-foreground hover:bg-accent disabled:opacity-30"
                  >
                    <ArrowUp className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveQuestion(index, 1)}
                    disabled={index === questions.length - 1}
                    className="rounded p-0.5 text-muted-foreground hover:bg-accent disabled:opacity-30"
                  >
                    <ArrowDown className="size-3.5" />
                  </button>
                </div>

                <div className="flex-1 space-y-2.5">
                  <Input
                    value={q.label}
                    onChange={(e) => updateQuestion(q.id, { label: e.target.value })}
                    placeholder="Texto de la pregunta"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <Select
                      value={q.type}
                      onValueChange={(value) =>
                        updateQuestion(q.id, { type: value as QuestionType })
                      }
                    >
                      <SelectTrigger className="h-9 w-40 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(QUESTION_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={q.required}
                        onChange={(e) => updateQuestion(q.id, { required: e.target.checked })}
                        className="size-3.5 rounded border-input"
                      />
                      Obligatoria
                    </label>

                    <button
                      type="button"
                      onClick={() => removeQuestion(q.id)}
                      className="ml-auto rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>

                  {q.type === "select" && (
                    <Input
                      value={(q.options ?? []).join(", ")}
                      onChange={(e) =>
                        updateQuestion(q.id, {
                          options: e.target.value
                            .split(",")
                            .map((o) => o.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="Opciones separadas por coma"
                      className="text-sm"
                    />
                  )}
                </div>
              </div>
            </div>
          ))}

          {questions.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Este brief no tiene preguntas todavía.
            </p>
          )}
        </div>
      </div>

      <Button onClick={handleSave} variant="gradient" disabled={isPending}>
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        Guardar cambios
      </Button>
    </div>
  );
}
