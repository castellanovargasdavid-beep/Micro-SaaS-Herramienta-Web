import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquareWarning, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/data/dashboard";
import { PRIORITY_BADGE_VARIANT } from "@/lib/incidents";

export const metadata: Metadata = { title: "Incidencias" };

export default async function IncidentsPage() {
  const { supabase, user } = await requireUser();

  const { data: incidents } = await supabase
    .from("incidents")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Incidencias</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pega un chat de WhatsApp o sube una nota de audio y deja que la IA
            arme el brief de incidencia por ti.
          </p>
        </div>
        <Button variant="gradient" asChild>
          <Link href="/dashboard/incidents/new">
            <Plus className="size-4" />
            Nueva incidencia
          </Link>
        </Button>
      </div>

      {incidents && incidents.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {incidents.map((incident) => (
            <Link key={incident.id} href={`/dashboard/incidents/${incident.id}`}>
              <Card className="h-full p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant={PRIORITY_BADGE_VARIANT[incident.priority]}>
                    {incident.priority}
                  </Badge>
                  <Badge variant="outline">{incident.type}</Badge>
                </div>
                <h3 className="mt-3 line-clamp-2 font-semibold">{incident.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {incident.description}
                </p>
                {incident.status === "archived" && (
                  <Badge variant="secondary" className="mt-3">
                    Archivada
                  </Badge>
                )}
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <MessageSquareWarning className="size-6" />
          </div>
          <h2 className="mt-4 font-semibold">Aún no tienes incidencias</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Pega el mensaje desordenado de un cliente o sube su nota de voz y
            la IA te arma el brief de incidencia estructurado.
          </p>
          <div className="mt-5">
            <Button variant="gradient" asChild>
              <Link href="/dashboard/incidents/new">
                <Plus className="size-4" />
                Nueva incidencia
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
