"use client";

import { useTransition } from "react";
import { Archive, Loader2, Radio, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { setBriefStatusAction } from "@/app/dashboard/briefs/actions";
import { Button } from "@/components/ui/button";
import type { BriefStatus } from "@/types/database";

export function BriefStatusToggle({
  briefId,
  status,
}: {
  briefId: string;
  status: BriefStatus;
}) {
  const [isPending, startTransition] = useTransition();

  function setStatus(next: BriefStatus, message: string) {
    startTransition(async () => {
      await setBriefStatusAction(briefId, next);
      toast.success(message);
    });
  }

  if (status === "draft") {
    return (
      <Button
        size="sm"
        variant="gradient"
        disabled={isPending}
        onClick={() => setStatus("published", "Brief publicado. Ya puedes compartir el enlace.")}
      >
        {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Radio className="size-3.5" />}
        Publicar
      </Button>
    );
  }

  if (status === "published") {
    return (
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() => setStatus("archived", "Brief archivado. El enlace público dejó de funcionar.")}
      >
        {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Archive className="size-3.5" />}
        Archivar
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={() => setStatus("published", "Brief republicado.")}
    >
      {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <RotateCcw className="size-3.5" />}
      Republicar
    </Button>
  );
}
