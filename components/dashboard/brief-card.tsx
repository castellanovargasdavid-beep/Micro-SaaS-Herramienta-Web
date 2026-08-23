import Link from "next/link";
import { ArrowUpRight, Inbox } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { NICHE_LABELS } from "@/lib/constants";
import type { Brief, BriefStatus } from "@/types/database";

const STATUS_VARIANT: Record<BriefStatus, "success" | "secondary" | "outline"> = {
  published: "success",
  draft: "secondary",
  archived: "outline",
};

const STATUS_LABEL: Record<BriefStatus, string> = {
  published: "Publicado",
  draft: "Borrador",
  archived: "Archivado",
};

export function BriefCard({
  brief,
  submissionsCount,
}: {
  brief: Brief;
  submissionsCount: number;
}) {
  return (
    <Link href={`/dashboard/briefs/${brief.id}`}>
      <Card className="group h-full p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
        <div className="flex items-start justify-between gap-2">
          <Badge variant={STATUS_VARIANT[brief.status]}>
            {STATUS_LABEL[brief.status]}
          </Badge>
          <ArrowUpRight className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
        </div>
        <h3 className="mt-3 line-clamp-2 font-semibold">{brief.title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {NICHE_LABELS[brief.niche]}
        </p>
        <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Inbox className="size-3.5" />
          {submissionsCount} {submissionsCount === 1 ? "respuesta" : "respuestas"}
        </div>
      </Card>
    </Link>
  );
}
