import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronRight, Inbox, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { Submission } from "@/types/database";

export function SubmissionsList({
  briefId,
  submissions,
}: {
  briefId: string;
  submissions: Submission[];
}) {
  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Inbox className="size-6" />
        </div>
        <h3 className="mt-4 font-semibold">Sin respuestas todavía</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Comparte el enlace público de este brief con tu cliente para
          empezar a recibir respuestas.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
      {submissions.map((s) => (
        <Link
          key={s.id}
          href={`/dashboard/briefs/${briefId}/submissions/${s.id}`}
          className="flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-accent"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {s.client_name ?? "Sin nombre"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {s.client_email} ·{" "}
              {formatDistanceToNow(new Date(s.created_at), {
                addSuffix: true,
                locale: es,
              })}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {s.status === "processed" ? (
              <Badge variant="success" className="gap-1">
                <Sparkles className="size-3" />
                Procesado
              </Badge>
            ) : (
              <Badge variant="secondary">Pendiente</Badge>
            )}
            <ChevronRight className="size-4 text-muted-foreground" />
          </div>
        </Link>
      ))}
    </div>
  );
}
