import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { BriefSettingsForm } from "@/components/dashboard/brief-settings-form";
import { BriefStatusToggle } from "@/components/dashboard/brief-status-toggle";
import { CopyLinkButton } from "@/components/dashboard/copy-link-button";
import { DeleteBriefButton } from "@/components/dashboard/delete-brief-button";
import { SubmissionsList } from "@/components/dashboard/submissions-list";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NICHE_LABELS } from "@/lib/constants";
import { requireUser } from "@/lib/data/dashboard";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Detalle del brief" };

export default async function BriefDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { supabase, user } = await requireUser();

  const { data: brief } = await supabase
    .from("briefs")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!brief) notFound();

  const { data: submissions } = await supabase
    .from("submissions")
    .select("*")
    .eq("brief_id", brief.id)
    .order("created_at", { ascending: false });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const publicUrl = `${appUrl}/b/${brief.id}`;

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Mis briefs
      </Link>

      <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{brief.title}</h1>
            <Badge variant="outline">{NICHE_LABELS[brief.niche]}</Badge>
          </div>
          {brief.status === "published" && (
            <div className="mt-2 flex items-center gap-2">
              <code className="truncate rounded-md bg-muted px-2 py-1 text-xs">
                {publicUrl}
              </code>
              <CopyLinkButton url={publicUrl} />
            </div>
          )}
        </div>
        <BriefStatusToggle briefId={brief.id} status={brief.status} />
      </div>

      <Tabs defaultValue="inbox" className="mt-6">
        <TabsList>
          <TabsTrigger value="inbox">
            Bandeja de entrada ({submissions?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="mt-4">
          <SubmissionsList briefId={brief.id} submissions={submissions ?? []} />
        </TabsContent>

        <TabsContent value="settings" className="mt-4 space-y-6">
          <BriefSettingsForm brief={brief} />
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
            <h3 className="text-sm font-semibold text-destructive">Zona de peligro</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Eliminar este brief borrará también todas sus respuestas de forma permanente.
            </p>
            <div className="mt-3">
              <DeleteBriefButton briefId={brief.id} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
