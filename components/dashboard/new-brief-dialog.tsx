"use client";

import { useActionState, useState } from "react";
import {
  Clapperboard,
  FilePlus2,
  LayoutTemplate,
  Loader2,
  Palette,
  PenLine,
} from "lucide-react";

import { createBriefAction, type CreateBriefState } from "@/app/dashboard/briefs/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { BriefTemplate } from "@/types/database";

const ICONS: Record<string, typeof LayoutTemplate> = {
  LayoutTemplate,
  PenLine,
  Palette,
  Clapperboard,
};

const initialState: CreateBriefState = {};

export function NewBriefDialog({ templates }: { templates: BriefTemplate[] }) {
  const [open, setOpen] = useState(false);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState(
    createBriefAction,
    initialState,
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="gradient">
          <FilePlus2 className="size-4" />
          Nuevo brief
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear un nuevo brief</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="templateId" value={templateId ?? ""} />

          <div className="space-y-1.5">
            <Label htmlFor="title">Título del brief</Label>
            <Input
              id="title"
              name="title"
              placeholder="Ej: Sitio web para Panadería Doña Rosa"
              required
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label>Empezar desde una plantilla (opcional)</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTemplateId(null)}
                className={cn(
                  "rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                  templateId === null
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-accent",
                )}
              >
                <span className="font-medium">En blanco</span>
                <p className="text-xs text-muted-foreground">Sin preguntas predefinidas</p>
              </button>
              {templates.map((t) => {
                const Icon = ICONS[t.icon ?? ""] ?? LayoutTemplate;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTemplateId(t.id)}
                    className={cn(
                      "rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                      templateId === t.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-accent",
                    )}
                  >
                    <span className="flex items-center gap-1.5 font-medium">
                      <Icon className="size-3.5" />
                      {t.name}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {t.questions.length} preguntas
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}

          <Button type="submit" variant="gradient" className="w-full" disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            Crear brief
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
