import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { DeleteIncidentButton } from "@/components/incidents/delete-incident-button";
import { EditIncidentForm } from "@/components/incidents/edit-incident-form";
import { IncidentStatusToggle } from "@/components/incidents/incident-status-toggle";
import { PRIORITY_BADGE_VARIANT } from "@/lib/incidents";
import { requireUser } from "@/lib/data/dashboard";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Detalle de incidencia" };

export default async function IncidentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { supabase, user } = await requireUser();

  const { data: incident } = await supabase
    .from("incidents")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!incident) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/dashboard/incidents"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Incidencias
      </Link>

      <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{incident.title}</h1>
            <Badge variant={PRIORITY_BADGE_VARIANT[incident.priority]}>
              {incident.priority}
            </Badge>
            {incident.status === "archived" && <Badge variant="secondary">Archivada</Badge>}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Creada el{" "}
            {new Date(incident.created_at).toLocaleDateString("es", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            · Origen: {incident.source === "audio" ? "Nota de audio" : "Texto"}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <IncidentStatusToggle incident={incident} />
        </div>
      </div>

      <div className="mt-6">
        <EditIncidentForm incident={incident} />
      </div>

      {incident.raw_input && (
        <details className="mt-6 rounded-xl border border-border p-4 text-sm">
          <summary className="cursor-pointer font-medium text-muted-foreground">
            Ver mensaje original
          </summary>
          <p className="mt-3 whitespace-pre-line text-muted-foreground">{incident.raw_input}</p>
        </details>
      )}

      <div className="mt-8 rounded-xl border border-destructive/30 bg-destructive/5 p-5">
        <h3 className="text-sm font-semibold text-destructive">Zona de peligro</h3>
        <div className="mt-3">
          <DeleteIncidentButton incidentId={incident.id} />
        </div>
      </div>
    </div>
  );
}
