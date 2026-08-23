"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { loginSchema, signupSchema } from "@/lib/validations/auth";

export interface AuthActionState {
  error?: string;
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return {
      error:
        error.code === "invalid_credentials"
          ? "Correo o contraseña incorrectos."
          : error.message,
    };
  }

  const next = formData.get("next");
  redirect(typeof next === "string" && next.startsWith("/") ? next : "/dashboard");
}

export async function signupAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${appUrl}/auth/callback`,
    },
  });

  if (error) {
    return {
      error:
        error.code === "user_already_exists"
          ? "Ya existe una cuenta con ese correo. Inicia sesión."
          : error.message,
    };
  }

  const redirectQuery = new URLSearchParams();
  const template = formData.get("template");
  const plan = formData.get("plan");
  if (typeof template === "string" && template) redirectQuery.set("template", template);
  if (typeof plan === "string" && plan) redirectQuery.set("plan", plan);

  // Si la confirmación por email está deshabilitada en el proyecto de Supabase,
  // signUp ya devuelve una sesión activa y podemos ir directo al dashboard.
  if (data.session) {
    redirect(`/dashboard?${redirectQuery.toString()}`);
  }

  redirectQuery.set("check_email", "1");
  redirect(`/signup?${redirectQuery.toString()}`);
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
