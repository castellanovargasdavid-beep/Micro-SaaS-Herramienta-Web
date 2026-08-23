"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";

import { loginAction, type AuthActionState } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = {};

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "";
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bienvenido de nuevo</CardTitle>
        <CardDescription>
          Inicia sesión para gestionar tus briefs.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <input type="hidden" name="next" value={next} />

          <div className="space-y-1.5">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
        </CardContent>

        <CardFooter className="mt-2 flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <LogIn className="size-4" />
            )}
            Iniciar sesión
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Regístrate gratis
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
