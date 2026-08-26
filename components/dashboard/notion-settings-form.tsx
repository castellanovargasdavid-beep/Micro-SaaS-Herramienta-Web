"use client";

import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";

import { updateNotionSettingsAction, type UpdateProfileState } from "@/app/dashboard/settings/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Profile } from "@/types/database";

const initialState: UpdateProfileState = {};

export function NotionSettingsForm({ profile }: { profile: Profile }) {
  const [state, formAction, pending] = useActionState(updateNotionSettingsAction, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Integración con Notion</CardTitle>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4 pb-6">
          <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
            1. Crea una integración interna en{" "}
            <a
              href="https://www.notion.so/my-integrations"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline"
            >
              notion.so/my-integrations
            </a>{" "}
            y copia su secreto. 2. Comparte tu base de datos con esa
            integración (botón &ldquo;Connections&rdquo; en la base de datos
            → agrégala). 3. Copia el ID de la base de datos desde su URL.
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notionToken">Internal Integration Secret</Label>
            <Input
              id="notionToken"
              name="notionToken"
              type="password"
              defaultValue={profile.notion_token ?? ""}
              placeholder="ntn_..."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notionDatabaseId">Database ID</Label>
            <Input
              id="notionDatabaseId"
              name="notionDatabaseId"
              defaultValue={profile.notion_database_id ?? ""}
              placeholder="32 caracteres, de la URL de tu base de datos"
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
