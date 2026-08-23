import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { SubmissionSummary } from "@/components/dashboard/submission-summary";
import { requireUser } from "@/lib/data/dashboard";

interface PageProps {
  params: Promise<{ id: string; submissionId: string }>;
}

export const metadata: Metadata = { title: "Respuesta del cliente" };

export default async function SubmissionDetailPage({ params }: PageProps) {
  const { id, submissionId } = await params;
  const { supabase, user } = await requireUser();

  const { data: brief } = await supabase
    .from("briefs")
    .select("id, title, questions")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!brief) notFound();

  const { data: submission } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", submissionId)
    .eq("brief_id", brief.id)
    .single();

  if (!submission) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={`/dashboard/briefs/${brief.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        {brief.title}
      </Link>

      <h1 className="mt-3 text-2xl font-bold tracking-tight">
        Respuesta de {submission.client_name ?? "cliente"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Enviado el{" "}
        {new Date(submission.created_at).toLocaleDateString("es", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      <div className="mt-6">
        <SubmissionSummary
          submissionId={submission.id}
          clientName={submission.client_name}
          clientEmail={submission.client_email}
          questions={brief.questions}
          answers={submission.answers}
          initialSummary={submission.ai_summary}
          initialMarkdown={submission.ai_summary_markdown}
        />
      </div>
    </div>
  );
}
