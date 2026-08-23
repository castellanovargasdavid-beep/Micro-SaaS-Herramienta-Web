import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Inbox } from "lucide-react";

import { BriefCard } from "@/components/dashboard/brief-card";
import { NewBriefDialog } from "@/components/dashboard/new-brief-dialog";
import { WelcomeBanner } from "@/components/dashboard/welcome-banner";
import { Progress } from "@/components/ui/progress";
import { FREE_PLAN_ACTIVE_BRIEFS_LIMIT } from "@/lib/constants";
import { getActiveBriefsThisMonth, requireUser } from "@/lib/data/dashboard";

export const metadata: Metadata = { title: "Mis briefs" };

export default async function DashboardPage() {
  const { supabase, user, profile } = await requireUser();

  const [{ data: briefs }, { data: templates }, activeThisMonth] =
    await Promise.all([
      supabase
        .from("briefs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("brief_templates")
        .select("*")
        .order("sort_order", { ascending: true }),
      getActiveBriefsThisMonth(supabase, user.id),
    ]);

  const briefIds = (briefs ?? []).map((b) => b.id);
  const { data: submissions } =
    briefIds.length > 0
      ? await supabase.from("submissions").select("id, brief_id").in("brief_id", briefIds)
      : { data: [] as { id: string; brief_id: string }[] };

  const submissionCounts = new Map<string, number>();
  for (const s of submissions ?? []) {
    submissionCounts.set(s.brief_id, (submissionCounts.get(s.brief_id) ?? 0) + 1);
  }

  const isFree = profile.plan === "free";

  return (
    <div className="mx-auto max-w-5xl">
      <Suspense>
        <WelcomeBanner />
      </Suspense>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mis briefs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Crea formularios y convierte las respuestas de tus clientes en
            briefs ejecutables.
          </p>
        </div>
        <NewBriefDialog templates={templates ?? []} />
      </div>

      {isFree && (
        <div className="mt-6 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              {activeThisMonth}/{FREE_PLAN_ACTIVE_BRIEFS_LIMIT} briefs activos
              este mes (plan Free)
            </span>
            <Link
              href="/dashboard/settings"
              className="font-medium text-primary hover:underline"
            >
              Actualizar a Pro
            </Link>
          </div>
          <Progress
            value={(activeThisMonth / FREE_PLAN_ACTIVE_BRIEFS_LIMIT) * 100}
            className="mt-2"
          />
        </div>
      )}

      {briefs && briefs.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {briefs.map((brief) => (
            <BriefCard
              key={brief.id}
              brief={brief}
              submissionsCount={submissionCounts.get(brief.id) ?? 0}
            />
          ))}
        </div>
      ) : (
        <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Inbox className="size-6" />
          </div>
          <h2 className="mt-4 font-semibold">Aún no tienes briefs</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Crea tu primer brief y comparte el enlace con tu cliente para
            empezar a recibir respuestas.
          </p>
          <div className="mt-5">
            <NewBriefDialog templates={templates ?? []} />
          </div>
        </div>
      )}
    </div>
  );
}
