"use client";

import { Mail, Phone, Plus, User, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { INCIDENT_PRIORITIES, INCIDENT_TYPES, PRIORITY_BADGE_VARIANT } from "@/lib/incidents";
import type { IncidentBrief, IncidentPriority, IncidentType } from "@/types/database";

export interface EditableIncidentBrief {
  title: string;
  priority: IncidentPriority;
  type: IncidentType;
  description: string;
  reproSteps: string[];
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  suggestedActions: string[];
}

export function briefToEditable(brief: IncidentBrief): EditableIncidentBrief {
  return {
    title: brief.titulo_corto,
    priority: brief.prioridad,
    type: brief.tipo,
    description: brief.descripcion_problema,
    reproSteps: brief.pasos_para_reproducir,
    contactName: brief.datos_contacto_cliente.nombre,
    contactEmail: brief.datos_contacto_cliente.email,
    contactPhone: brief.datos_contacto_cliente.telefono,
    suggestedActions: brief.acciones_sugeridas,
  };
}

function StringListEditor({
  items,
  onChange,
  placeholder,
  emptyLabel,
}: {
  items: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  emptyLabel: string;
}) {
  return (
    <div className="space-y-2">
      {items.length === 0 && (
        <p className="text-xs text-muted-foreground italic">{emptyLabel}</p>
      )}
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            value={item}
            placeholder={placeholder}
            onChange={(e) => {
              const next = [...items];
              next[i] = e.target.value;
              onChange(next);
            }}
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            className="shrink-0 text-muted-foreground hover:text-destructive"
            aria-label="Eliminar"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...items, ""])}
      >
        <Plus className="size-3.5" />
        Añadir línea
      </Button>
    </div>
  );
}

export function IncidentBriefCard({
  value,
  onChange,
  readOnly = false,
}: {
  value: EditableIncidentBrief;
  onChange?: (next: EditableIncidentBrief) => void;
  readOnly?: boolean;
}) {
  function set<K extends keyof EditableIncidentBrief>(key: K, val: EditableIncidentBrief[K]) {
    onChange?.({ ...value, [key]: val });
  }

  if (readOnly) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={PRIORITY_BADGE_VARIANT[value.priority]}>{value.priority}</Badge>
          <Badge variant="outline">{value.type}</Badge>
        </div>
        <h3 className="text-lg font-semibold">{value.title}</h3>
        <p className="whitespace-pre-line text-sm text-muted-foreground">{value.description}</p>

        {value.reproSteps.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Pasos para reproducir
            </p>
            <ol className="mt-1.5 list-decimal space-y-1 pl-5 text-sm">
              {value.reproSteps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        )}

        {(value.contactName || value.contactEmail || value.contactPhone) && (
          <div className="flex flex-col gap-1 text-sm">
            {value.contactName && (
              <span className="flex items-center gap-1.5">
                <User className="size-3.5 text-muted-foreground" />
                {value.contactName}
              </span>
            )}
            {value.contactEmail && (
              <span className="flex items-center gap-1.5">
                <Mail className="size-3.5 text-muted-foreground" />
                {value.contactEmail}
              </span>
            )}
            {value.contactPhone && (
              <span className="flex items-center gap-1.5">
                <Phone className="size-3.5 text-muted-foreground" />
                {value.contactPhone}
              </span>
            )}
          </div>
        )}

        {value.suggestedActions.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Acciones sugeridas
            </p>
            <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm">
              {value.suggestedActions.map((action, i) => (
                <li key={i}>{action}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="incident-title">Título corto</Label>
        <Input
          id="incident-title"
          value={value.title}
          onChange={(e) => set("title", e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Prioridad</Label>
          <Select value={value.priority} onValueChange={(v) => set("priority", v as IncidentPriority)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INCIDENT_PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Tipo</Label>
          <Select value={value.type} onValueChange={(v) => set("type", v as IncidentType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INCIDENT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="incident-description">Descripción del problema</Label>
        <Textarea
          id="incident-description"
          rows={4}
          value={value.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Pasos para reproducir</Label>
        <StringListEditor
          items={value.reproSteps}
          onChange={(v) => set("reproSteps", v)}
          placeholder="Ej. Entrar a Ajustes > Facturación"
          emptyLabel="No aplica o no se especificaron pasos."
        />
      </div>

      <div className="space-y-1.5">
        <Label>Datos de contacto del cliente</Label>
        <div className="grid gap-2 sm:grid-cols-3">
          <Input
            placeholder="Nombre"
            value={value.contactName ?? ""}
            onChange={(e) => set("contactName", e.target.value || null)}
          />
          <Input
            placeholder="Email"
            type="email"
            value={value.contactEmail ?? ""}
            onChange={(e) => set("contactEmail", e.target.value || null)}
          />
          <Input
            placeholder="Teléfono"
            value={value.contactPhone ?? ""}
            onChange={(e) => set("contactPhone", e.target.value || null)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Acciones sugeridas</Label>
        <StringListEditor
          items={value.suggestedActions}
          onChange={(v) => set("suggestedActions", v)}
          placeholder="Ej. Pedir captura de pantalla del error"
          emptyLabel="Sin acciones sugeridas."
        />
      </div>
    </div>
  );
}
