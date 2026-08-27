"use client";

import { useTransition } from "react";
import { Archive, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { setIncidentStatusAction } from "@/app/dashboard/incidents/actions";
import { Button } from "@/components/ui/button";
import type { Incident } from "@/types/database";

export function IncidentStatusToggle({ incident }: { incident: Incident }) {
  const [isPending, startTransition] = useTransition();

  if (incident.status === "archived") {
    return (
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await setIncidentStatusAction(incident.id, "confirmed");
            toast.success("Incidencia reabierta");
          })
        }
      >
        {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <RotateCcw className="size-3.5" />}
        Reabrir
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await setIncidentStatusAction(incident.id, "archived");
          toast.success("Incidencia archivada");
        })
      }
    >
      {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Archive className="size-3.5" />}
      Archivar
    </Button>
  );
}
