import type { Metadata } from "next";

import { IncidentChatbot } from "@/components/incidents/incident-chatbot";
import { requireUser } from "@/lib/data/dashboard";

export const metadata: Metadata = { title: "Nueva incidencia" };

export default async function NewIncidentPage() {
  await requireUser();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight">Nueva incidencia</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Pega el mensaje de WhatsApp del cliente o sube su nota de audio. La IA
        transcribe (si aplica) y arma el brief de incidencia por ti.
      </p>

      <div className="mt-6">
        <IncidentChatbot />
      </div>
    </div>
  );
}
