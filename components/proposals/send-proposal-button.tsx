"use client";

import { useTransition } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { sendProposalAction } from "@/app/dashboard/proposals/actions";
import { Button } from "@/components/ui/button";

export function SendProposalButton({ proposalId }: { proposalId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="gradient"
      size="sm"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await sendProposalAction(proposalId);
          toast.success("Propuesta enviada. Ya puedes compartir el enlace público.");
        })
      }
    >
      {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
      Enviar propuesta
    </Button>
  );
}
