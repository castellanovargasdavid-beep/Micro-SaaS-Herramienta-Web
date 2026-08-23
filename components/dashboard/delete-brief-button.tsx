"use client";

import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";

import { deleteBriefAction } from "@/app/dashboard/briefs/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DeleteBriefButton({ briefId }: { briefId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="text-destructive hover:text-destructive">
          <Trash2 className="size-3.5" />
          Eliminar brief
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Eliminar este brief?</DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. Se eliminarán también todas las
            respuestas recibidas.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={() => startTransition(() => deleteBriefAction(briefId))}
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Sí, eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
