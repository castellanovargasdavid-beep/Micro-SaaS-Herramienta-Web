import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { AddMoreForm } from "@/components/public/add-more-form";
import { BriefForm } from "@/components/public/brief-form";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getBrief(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("brief_public")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data;
}

// Misma cookie que guarda submitBriefAction al terminar el formulario — ver
// app/b/[id]/actions.ts. Solo identifica cuál fue la última submission de
// este navegador; la ventana de tiempo real siempre se recalcula aquí desde
// created_at + edit_window_hours, con el service role (anon no puede leer
// submissions directamente).
async function getActiveFollowUp(briefId: string, editWindowHours: number) {
  if (editWindowHours <= 0) return null;

  const submissionId = (await cookies()).get(`bq_sub_${briefId}`)?.value;
  if (!submissionId) return null;

  const admin = createAdminClient();
  const { data: submission } = await admin
    .from("submissions")
    .select("id, brief_id, client_name, created_at")
    .eq("id", submissionId)
    .eq("brief_id", briefId)
    .maybeSingle();
  if (!submission) return null;

  const deadlineMs =
    new Date(submission.created_at).getTime() + editWindowHours * 60 * 60 * 1000;
  if (Date.now() > deadlineMs) return null;

  return {
    submissionId: submission.id,
    clientFirstName: submission.client_name?.split(" ")[0] ?? null,
    deadline: new Date(deadlineMs).toLocaleString("es", {
      dateStyle: "long",
      timeStyle: "short",
    }),
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const brief = await getBrief(id);
  return { title: brief ? brief.title : "Formulario no disponible" };
}

export default async function PublicBriefPage({ params }: PageProps) {
  const { id } = await params;
  const brief = await getBrief(id);

  if (!brief) {
    notFound();
  }

  const followUp = await getActiveFollowUp(brief.id, brief.edit_window_hours);
  if (followUp) {
    return (
      <AddMoreForm
        briefId={brief.id}
        briefTitle={brief.title}
        submissionId={followUp.submissionId}
        clientFirstName={followUp.clientFirstName}
        deadline={followUp.deadline}
      />
    );
  }

  return <BriefForm brief={brief} />;
}
