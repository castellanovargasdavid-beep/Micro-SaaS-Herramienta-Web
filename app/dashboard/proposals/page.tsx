import type { Metadata } from "next";
import Link from "next/link";
import { FileSignature, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/data/dashboard";
import type { ProposalStatus } from "@/types/database";

export const metadata: Metadata = { title: "Propuestas" };

const STATUS_VARIANT: Record<ProposalStatus, "secondary" | "warning" | "success" | "outline"> = {
  draft: "secondary",
  sent: "warning",
  accepted: "success",
  declined: "outline",
};

const STATUS_LABEL: Record<ProposalStatus, string> = {
  draft: "Borrador",
  sent: "Enviada",
  accepted: "Firmada",
  declined: "Rechazada",
};

export default async function ProposalsPage() {
  const { supabase, user } = await requireUser();

  const { data: proposals } = await supabase
    .from("proposals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Propuestas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Propuestas comerciales con alcance y precio, listas para que tu
            cliente las firme en línea.
          </p>
        </div>
        <Button variant="gradient" asChild>
          <Link href="/dashboard/proposals/new">
            <Plus className="size-4" />
            Nueva propuesta
          </Link>
        </Button>
      </div>

      {proposals && proposals.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {proposals.map((p) => (
            <Link key={p.id} href={`/dashboard/proposals/${p.id}`}>
              <Card className="h-full p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant={STATUS_VARIANT[p.status]}>{STATUS_LABEL[p.status]}</Badge>
                  {p.price != null && (
                    <span className="text-sm font-semibold">
                      {p.currency} {p.price.toLocaleString()}
                    </span>
                  )}
                </div>
                <h3 className="mt-3 line-clamp-2 font-semibold">{p.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {p.client_name ?? "Sin cliente asignado"}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <FileSignature className="size-6" />
          </div>
          <h2 className="mt-4 font-semibold">Aún no tienes propuestas</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Crea una propuesta con el alcance y precio del proyecto para que
            tu cliente la firme en línea.
          </p>
          <div className="mt-5">
            <Button variant="gradient" asChild>
              <Link href="/dashboard/proposals/new">
                <Plus className="size-4" />
                Nueva propuesta
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
