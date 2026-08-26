"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ProposalScopeItem } from "@/types/database";

export function ScopeItemsEditor({
  items,
  onChange,
}: {
  items: ProposalScopeItem[];
  onChange: (items: ProposalScopeItem[]) => void;
}) {
  function update(index: number, patch: Partial<ProposalScopeItem>) {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="rounded-lg border border-border p-3.5">
          <div className="flex items-start gap-2">
            <div className="flex-1 space-y-2">
              <Input
                value={item.label}
                onChange={(e) => update(index, { label: e.target.value })}
                placeholder="Ej: Diseño de landing page"
              />
              <Textarea
                value={item.description}
                onChange={(e) => update(index, { description: e.target.value })}
                placeholder="Detalle breve de este entregable (opcional)"
                rows={2}
                className="text-sm"
              />
            </div>
            <button
              type="button"
              onClick={() => remove(index)}
              className="mt-1 rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        </div>
      ))}

      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => onChange([...items, { label: "", description: "" }])}
      >
        <Plus className="size-3.5" />
        Añadir alcance
      </Button>
    </div>
  );
}
