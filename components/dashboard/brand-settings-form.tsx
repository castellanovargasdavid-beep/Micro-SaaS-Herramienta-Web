"use client";

import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";

import { updateProfileAction, type UpdateProfileState } from "@/app/dashboard/settings/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Profile } from "@/types/database";

const initialState: UpdateProfileState = {};

export function BrandSettingsForm({ profile }: { profile: Profile }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Perfil y marca</CardTitle>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4 pb-6">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Nombre completo</Label>
            <Input id="fullName" name="fullName" defaultValue={profile.full_name ?? ""} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" value={profile.email} disabled />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="brandName">Nombre de tu marca/estudio</Label>
              <Input
                id="brandName"
                name="brandName"
                defaultValue={profile.brand_name ?? ""}
                placeholder="Ej: Estudio Rosa"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="brandColor">Color de marca</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  defaultValue={profile.brand_color ?? "#6d28d9"}
                  className="size-10 shrink-0 cursor-pointer rounded-md border border-input"
                  onChange={(e) => {
                    const input = document.getElementById("brandColor") as HTMLInputElement | null;
                    if (input) input.value = e.target.value;
                  }}
                />
                <Input
                  id="brandColor"
                  name="brandColor"
                  defaultValue={profile.brand_color ?? "#6d28d9"}
                />
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="brandLogoUrl">URL del logo (Pro)</Label>
            <Input
              id="brandLogoUrl"
              name="brandLogoUrl"
              type="url"
              defaultValue={profile.brand_logo_url ?? ""}
              placeholder="https://..."
              disabled={profile.plan === "free"}
            />
          </div>

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          {state.success && <p className="text-sm text-success">Cambios guardados.</p>}
        </CardContent>
        <div className="border-t border-border px-6 py-4">
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Guardar
          </Button>
        </div>
      </form>
    </Card>
  );
}
