"use client";

import { useState, useTransition } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { updateIncidentAction } from "@/app/dashboard/incidents/actions";
import { IncidentBriefCard, type EditableIncidentBrief } from "@/components/incidents/incident-brief-card";
import { Button } from "@/components/ui/button";
import type { Incident } from "@/types/database";

function incidentToEditable(incident: Incident): EditableIncidentBrief {
  return {
    title: incident.title,
    priority: incident.priority,
    type: incident.type,
    description: incident.description,
    reproSteps: incident.repro_steps,
    contactName: incident.contact_name,
    contactEmail: incident.contact_email,
    contactPhone: incident.contact_phone,
    suggestedActions: incident.suggested_actions,
  };
}

export function EditIncidentForm({ incident }: { incident: Incident }) {
  const [value, setValue] = useState<EditableIncidentBrief>(incidentToEditable(incident));
  const [isPending, startTransition] = useTransition();

  const readOnly = incident.status === "archived";

  function handleSave() {
    startTransition(async () => {
      const result = await updateIncidentAction(incident.id, {
        title: value.title,
        priority: value.priority,
        type: value.type,
        description: value.description,
        reproSteps: value.reproSteps,
        contactName: value.contactName,
        contactEmail: value.contactEmail,
        contactPhone: value.contactPhone,
        suggestedActions: value.suggestedActions,
        rawInput: incident.raw_input,
        source: incident.source,
      });
      if (result.error) toast.error(result.error);
      else toast.success("Incidencia actualizada");
    });
  }

  return (
    <div className="space-y-5">
      {readOnly ? (
        <IncidentBriefCard value={value} readOnly />
      ) : (
        <>
          <IncidentBriefCard value={value} onChange={setValue} />
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Guardar cambios
          </Button>
        </>
      )}
    </div>
  );
}
