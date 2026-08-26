import Link from "next/link";
import { FileQuestion } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ProposalNotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <FileQuestion className="size-7" />
      </div>
      <h1 className="mt-4 text-xl font-semibold">Esta propuesta no está disponible</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        El enlace puede haber expirado o la propuesta todavía es un borrador.
      </p>
      <Button asChild variant="outline" className="mt-6">
        <Link href="/">Ir a BriefFast</Link>
      </Button>
    </div>
  );
}
