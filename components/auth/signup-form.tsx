"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, Mail, UserPlus } from "lucide-react";

import { signupAction, type AuthActionState } from "@/app/(auth)/actions";
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
import { NICHE_LABELS } from "@/lib/constants";
import type { BriefNiche } from "@/types/database";

const initialState: AuthActionState = {};

export function SignupForm() {
  const searchParams = useSearchParams();
  const template = searchParams.get("template") ?? "";
  const plan = searchParams.get("plan") ?? "";
  const checkEmail = searchParams.get("check_email") === "1";
  const [state, formAction, pending] = useActionState(signupAction, initialState);

  if (checkEmail) {
    return (
      <Card>
        <CardHeader>
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail className="size-6" />
          </div>
          <CardTitle className="mt-3 text-center">Revisa tu correo</CardTitle>
          <CardDescription className="text-center">
            Te enviamos un enlace de confirmación. Ábrelo para activar tu
            cuenta y empezar a crear briefs.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/login">Volver a iniciar sesión</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crea tu cuenta</CardTitle>
        <CardDescription>
          {template && template in NICHE_LABELS
            ? `Empieza con la plantilla de ${NICHE_LABELS[template as BriefNiche]}.`
            : "Hasta 2 briefs activos gratis cada mes."}
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <input type="hidden" name="template" value={template} />
          <input type="hidden" name="plan" value={plan} />

          <div className="space-y-1.5">
            <Label htmlFor="fullName">Nombre completo</Label>
            <Input
              id="fullName"
              name="fullName"
              autoComplete="name"
              placeholder="Tu nombre"
              required
            />
          </div>

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
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
        </CardContent>

        <CardFooter className="mt-2 flex flex-col gap-4">
          <Button type="submit" variant="gradient" className="w-full" disabled={pending}>
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <UserPlus className="size-4" />
            )}
            Crear cuenta gratis
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Inicia sesión
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
