import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BriefForm } from "@/components/public/brief-form";
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

  return <BriefForm brief={brief} />;
}
