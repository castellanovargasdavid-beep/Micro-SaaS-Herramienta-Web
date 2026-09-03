"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Pencil,
  Sparkles,
  Wand2,
} from "lucide-react";

import { submitBriefAction } from "@/app/b/[id]/actions";
import {
  AttachmentsStep,
  type PendingAttachment,
} from "@/components/public/attachments-step";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EXTRA_NOTES_ANSWER_KEY } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { BriefPublic } from "@/types/database";

type Step =
  | { kind: "intro" }
  | { kind: "contact" }
  | { kind: "question"; index: number }
  | { kind: "followup"; forQuestionIndex: number; question: string }
  | { kind: "attachments" }
  | { kind: "review" }
  | { kind: "done" };

export function BriefForm({ brief }: { brief: BriefPublic }) {
  const questions = brief.questions;
  const totalSteps = questions.length + 3; // contacto + preguntas + adjuntos + revisión

  const [step, setStep] = useState<Step>({ kind: "intro" });
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [followupDraft, setFollowupDraft] = useState("");
  const [editingField, setEditingField] = useState<string | null>(null);
  const [checkingAnswer, setCheckingAnswer] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const progress = useMemo(() => {
    if (step.kind === "intro") return 0;
    if (step.kind === "contact") return 1 / totalSteps;
    if (step.kind === "question") return (step.index + 2) / totalSteps;
    if (step.kind === "followup") return (step.forQuestionIndex + 2.5) / totalSteps;
    if (step.kind === "attachments") return (questions.length + 2) / totalSteps;
    return 1;
  }, [step, totalSteps, questions.length]);

  function goToContact() {
    setStep({ kind: "contact" });
  }

  function goNextFromContact() {
    if (!clientName.trim() || !clientEmail.trim()) {
      setError("Completa tu nombre y correo para continuar.");
      return;
    }
    setError(null);
    if (questions.length > 0) {
      setStep({ kind: "question", index: 0 });
    } else {
      setStep({ kind: "attachments" });
    }
  }

  function advancePastQuestion(index: number) {
    if (index + 1 < questions.length) {
      setStep({ kind: "question", index: index + 1 });
    } else {
      setStep({ kind: "attachments" });
    }
  }

  async function goNextFromQuestion(index: number) {
    const q = questions[index];
    const answer = answers[q.id]?.trim() ?? "";

    if (q.required && !answer) {
      setError("Esta pregunta es obligatoria.");
      return;
    }
    setError(null);

    // Preguntas dinámicas con IA: si la respuesta es muy vaga, la IA genera
    // una repregunta concreta antes de avanzar, en vez de dejar pasar un
    // "algo moderno" que no le sirve a nadie.
    const canRefine =
      (q.type === "text" || q.type === "textarea") && answer.length > 0;

    if (canRefine) {
      setCheckingAnswer(true);
      try {
        const res = await fetch("/api/refine-answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionLabel: q.label, answer }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.isVague && data.followUpQuestion) {
            setFollowupDraft("");
            setCheckingAnswer(false);
            setStep({
              kind: "followup",
              forQuestionIndex: index,
              question: data.followUpQuestion,
            });
            return;
          }
        }
      } catch {
        // Si falla el chequeo, simplemente avanzamos sin repregunta.
      }
      setCheckingAnswer(false);
    }

    advancePastQuestion(index);
  }

  function goNextFromFollowup(forQuestionIndex: number) {
    const q = questions[forQuestionIndex];
    if (followupDraft.trim()) {
      setAnswers((prev) => ({
        ...prev,
        [q.id]: `${prev[q.id]?.trim() ?? ""}\n\nAclaración: ${followupDraft.trim()}`,
      }));
    }
    advancePastQuestion(forQuestionIndex);
  }

  function goBack() {
    setError(null);
    if (step.kind === "followup") {
      setStep({ kind: "question", index: step.forQuestionIndex });
    } else if (step.kind === "attachments") {
      setStep(
        questions.length > 0
          ? { kind: "question", index: questions.length - 1 }
          : { kind: "contact" },
      );
    } else if (step.kind === "question" && step.index > 0) {
      setStep({ kind: "question", index: step.index - 1 });
    } else if (step.kind === "question" && step.index === 0) {
      setStep({ kind: "contact" });
    } else if (step.kind === "review") {
      setStep({ kind: "attachments" });
    } else if (step.kind === "contact") {
      setStep({ kind: "intro" });
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    const finalAnswers = additionalNotes.trim()
      ? { ...answers, [EXTRA_NOTES_ANSWER_KEY]: additionalNotes.trim() }
      : answers;
    const result = await submitBriefAction(brief.id, brief.title, questions, {
      clientName,
      clientEmail,
      answers: finalAnswers,
      attachments,
    });
    setSubmitting(false);

    if (result.status === "success") {
      setStep({ kind: "done" });
    } else {
      setError(result.error ?? "Ocurrió un error. Intenta de nuevo.");
    }
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-lg flex-col px-4 py-8 sm:py-12">
      {step.kind !== "intro" && step.kind !== "done" && (
        <div className="mb-8">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-primary"
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {step.kind === "intro" && (
          <StepShell key="intro">
            <div
              className="mb-4 flex size-12 items-center justify-center rounded-xl"
              style={{
                backgroundColor: brief.brand_color
                  ? `${brief.brand_color}20`
                  : undefined,
              }}
            >
              <Sparkles
                className="size-6"
                style={{ color: brief.brand_color ?? undefined }}
              />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-balance">
              {brief.title}
            </h1>
            <p className="mt-3 text-muted-foreground">
              {brief.intro_message ??
                "Responde estas preguntas para que podamos entender exactamente lo que necesitas. Te tomará solo unos minutos."}
            </p>
            <Button
              onClick={goToContact}
              size="lg"
              variant="gradient"
              className="mt-6 w-full sm:w-auto"
            >
              Empezar
              <ArrowRight className="size-4" />
            </Button>
          </StepShell>
        )}

        {step.kind === "contact" && (
          <StepShell key="contact">
            <h2 className="text-xl font-semibold">Antes de empezar…</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              ¿Cómo te contactamos con los resultados?
            </p>
            <div className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="clientName">Tu nombre</Label>
                <Input
                  id="clientName"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Nombre completo"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="clientEmail">Tu correo</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="tu@email.com"
                />
              </div>
            </div>
            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
            <StepNav onBack={goBack} onNext={goNextFromContact} />
          </StepShell>
        )}

        {step.kind === "question" && (
          <StepShell key={`q-${step.index}`}>
            <span className="text-xs font-medium text-muted-foreground">
              Pregunta {step.index + 1} de {questions.length}
            </span>
            <h2 className="mt-1 text-xl font-semibold text-balance">
              {questions[step.index].label}
              {questions[step.index].required && (
                <span className="text-destructive"> *</span>
              )}
            </h2>
            <div className="mt-5">
              <QuestionField
                question={questions[step.index]}
                value={answers[questions[step.index].id] ?? ""}
                onChange={(value) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [questions[step.index].id]: value,
                  }))
                }
              />
            </div>
            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
            <StepNav
              onBack={goBack}
              onNext={() => goNextFromQuestion(step.index)}
              loading={checkingAnswer}
            />
          </StepShell>
        )}

        {step.kind === "followup" && (
          <StepShell key="followup">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
              <Wand2 className="size-3.5" />
              Una pregunta rápida para entenderte mejor
            </span>
            <h2 className="mt-1 text-xl font-semibold text-balance">
              {step.question}
            </h2>
            <div className="mt-5">
              <Textarea
                value={followupDraft}
                onChange={(e) => setFollowupDraft(e.target.value)}
                rows={4}
                autoFocus
                placeholder="Cuéntanos un poco más..."
              />
            </div>
            <div className="mt-6 flex items-center gap-3">
              <Button type="button" variant="outline" onClick={goBack}>
                <ArrowLeft className="size-4" />
                Atrás
              </Button>
              <Button
                type="button"
                variant="gradient"
                className="flex-1"
                onClick={() => goNextFromFollowup(step.forQuestionIndex)}
              >
                Continuar
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </StepShell>
        )}

        {step.kind === "attachments" && (
          <StepShell key="attachments">
            <h2 className="text-xl font-semibold">¿Algo más que compartir?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Una nota de voz, un archivo o unas palabras escritas — todo
              ayuda, y es opcional.
            </p>
            <div className="mt-5">
              <AttachmentsStep value={attachments} onChange={setAttachments} />
            </div>
            <div className="mt-4 space-y-1.5">
              <Label htmlFor="additionalNotes">
                ¿Quieres escribir algo más aquí mismo? (opcional)
              </Label>
              <Textarea
                id="additionalNotes"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Cualquier detalle extra, referencia o aclaración que quieras agregar..."
                rows={4}
              />
            </div>
            <StepNav onBack={goBack} onNext={() => setStep({ kind: "review" })} />
          </StepShell>
        )}

        {step.kind === "review" && (
          <StepShell key="review">
            <h2 className="text-xl font-semibold">Revisa tus respuestas</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Si algo no está bien, dale a &quot;Editar&quot; y corrígelo aquí mismo.
            </p>
            <dl className="mt-5 space-y-3 divide-y divide-border rounded-xl border border-border p-4">
              <ReviewRow
                label="Contacto"
                isEditing={editingField === "contact"}
                onToggleEdit={() =>
                  setEditingField((f) => (f === "contact" ? null : "contact"))
                }
                display={
                  <>
                    {clientName} · {clientEmail}
                  </>
                }
                editor={
                  <div className="space-y-2.5">
                    <Input
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Nombre completo"
                      autoFocus
                    />
                    <Input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="tu@email.com"
                    />
                  </div>
                }
              />
              {questions.map((q) => (
                <ReviewRow
                  key={q.id}
                  label={q.label}
                  isEditing={editingField === `q-${q.id}`}
                  onToggleEdit={() =>
                    setEditingField((f) => (f === `q-${q.id}` ? null : `q-${q.id}`))
                  }
                  display={
                    <span className="whitespace-pre-wrap">
                      {answers[q.id]?.trim() || "—"}
                    </span>
                  }
                  editor={
                    <QuestionField
                      question={q}
                      value={answers[q.id] ?? ""}
                      onChange={(value) =>
                        setAnswers((prev) => ({ ...prev, [q.id]: value }))
                      }
                    />
                  }
                />
              ))}
              <ReviewRow
                label="Notas adicionales"
                isEditing={editingField === "notes"}
                onToggleEdit={() =>
                  setEditingField((f) => (f === "notes" ? null : "notes"))
                }
                display={
                  <span className="whitespace-pre-wrap">
                    {additionalNotes.trim() || "—"}
                  </span>
                }
                editor={
                  <Textarea
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Cualquier detalle extra, referencia o aclaración que quieras agregar..."
                    rows={4}
                    autoFocus
                  />
                }
              />
              <ReviewRow
                label="Adjuntos"
                isEditing={editingField === "attachments"}
                onToggleEdit={() =>
                  setEditingField((f) =>
                    f === "attachments" ? null : "attachments",
                  )
                }
                display={
                  attachments.length > 0
                    ? `${attachments.length} archivo(s) adjunto(s)`
                    : "Ninguno"
                }
                editor={
                  <AttachmentsStep value={attachments} onChange={setAttachments} />
                }
              />
            </dl>
            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
            <div className="mt-6 flex items-center gap-3">
              <Button type="button" variant="outline" onClick={goBack} disabled={submitting}>
                <ArrowLeft className="size-4" />
                Atrás
              </Button>
              <Button
                type="button"
                variant="gradient"
                className="flex-1"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
                Enviar respuestas
              </Button>
            </div>
          </StepShell>
        )}

        {step.kind === "done" && (
          <StepShell key="done">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
              <CheckCircle2 className="size-7" />
            </div>
            <h2 className="mt-4 text-center text-xl font-semibold">
              ¡Listo, {clientName.split(" ")[0]}!
            </h2>
            <p className="mt-2 text-center text-muted-foreground">
              Tus respuestas fueron enviadas correctamente. Te contactaremos
              pronto con los siguientes pasos.
            </p>
          </StepShell>
        )}
      </AnimatePresence>
    </div>
  );
}

function StepShell({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.25 }}
      className="flex-1"
    >
      {children}
    </motion.div>
  );
}

function StepNav({
  onBack,
  onNext,
  loading,
}: {
  onBack: () => void;
  onNext: () => void;
  loading?: boolean;
}) {
  return (
    <div className="mt-6 flex items-center gap-3">
      <Button type="button" variant="outline" onClick={onBack} disabled={loading}>
        <ArrowLeft className="size-4" />
        Atrás
      </Button>
      <Button
        type="button"
        variant="gradient"
        className="flex-1"
        onClick={onNext}
        disabled={loading}
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : null}
        Continuar
        {!loading && <ArrowRight className="size-4" />}
      </Button>
    </div>
  );
}

function ReviewRow({
  label,
  isEditing,
  onToggleEdit,
  display,
  editor,
}: {
  label: string;
  isEditing: boolean;
  onToggleEdit: () => void;
  display: React.ReactNode;
  editor: React.ReactNode;
}) {
  return (
    <div className="pt-3 first:pt-0">
      <div className="flex items-start justify-between gap-3">
        <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
        <button
          type="button"
          onClick={onToggleEdit}
          className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          {isEditing ? (
            "Listo"
          ) : (
            <>
              <Pencil className="size-3" />
              Editar
            </>
          )}
        </button>
      </div>
      <dd className="mt-1.5 text-sm">{isEditing ? editor : display}</dd>
    </div>
  );
}

function QuestionField({
  question,
  value,
  onChange,
}: {
  question: BriefPublic["questions"][number];
  value: string;
  onChange: (value: string) => void;
}) {
  const inputClassName = "text-base";

  if (question.type === "textarea") {
    return (
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={question.placeholder}
        rows={5}
        autoFocus
        className={inputClassName}
      />
    );
  }

  if (question.type === "select") {
    return (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={cn("h-12", inputClassName)}>
          <SelectValue placeholder="Selecciona una opción" />
        </SelectTrigger>
        <SelectContent>
          {question.options?.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Input
      type={question.type === "date" ? "date" : question.type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={question.placeholder}
      autoFocus
      className={cn("h-12", inputClassName)}
    />
  );
}
