"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isSupabaseConfigError = /supabase/i.test(error.message);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-7" />
      </div>
      <h1 className="mt-4 text-xl font-semibold">Algo salió mal</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {isSupabaseConfigError
          ? "Esta sección necesita que Supabase esté configurado. Verifica NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY y SUPABASE_SERVICE_ROLE_KEY en las variables de entorno del proyecto."
          : "Ocurrió un error inesperado. Puedes intentar de nuevo o volver al inicio."}
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Button variant="outline" onClick={() => reset()}>
          <RefreshCcw className="size-3.5" />
          Reintentar
        </Button>
        <Button asChild>
          <Link href="/">Ir al inicio</Link>
        </Button>
      </div>
    </div>
  );
}
