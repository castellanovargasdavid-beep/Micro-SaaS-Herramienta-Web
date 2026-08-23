import {
  ArrowRight,
  CalendarClock,
  ImageIcon,
  ListChecks,
  MessageCircle,
  Sparkles,
  Target,
} from "lucide-react";

export function BeforeAfter() {
  return (
    <section id="comparativa" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-semibold uppercase tracking-wide text-primary">
          Antes vs. Después
        </span>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          De un mensaje caótico a un brief que puedes ejecutar hoy
        </h2>
        <p className="mt-4 text-muted-foreground">
          Tus clientes no piensan en briefs, piensan en WhatsApp. BriefFast
          traduce eso a algo con lo que realmente puedes trabajar.
        </p>
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
        {/* Antes: chat de WhatsApp */}
        <div className="rounded-2xl border border-border bg-[#e5ddd0] p-4 shadow-sm dark:bg-[#2a2f28] sm:p-6">
          <div className="mb-3 flex items-center gap-2 text-xs font-medium text-[#3b4a3b] dark:text-[#c8d6c4]">
            <MessageCircle className="size-4" />
            Mensaje del cliente
          </div>
          <div className="space-y-2">
            <ChatBubble>
              holaa disculpa la hora jaja necesito una ayuda urgente
            </ChatBubble>
            <ChatBubble>
              es para mi negocio, quiero una pagina o algo asi para vender,
              no se bien como se llama eso
            </ChatBubble>
            <ChatBubble>
              tengo fotos en el celular te las mando despues, ah y necesito
              que este listo rapido porfa 🙏
            </ChatBubble>
            <ChatBubble>
              cuanto cobras? tengo un presupuesto no muy grande la verdad
            </ChatBubble>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md lg:rotate-0">
            <ArrowRight className="size-5" />
          </div>
        </div>

        {/* Después: brief limpio */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
              <Sparkles className="size-3.5" />
              Brief generado por IA
            </span>
            <span className="rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-medium text-success">
              Listo para ejecutar
            </span>
          </div>

          <div className="space-y-4">
            <Field icon={Target} label="Objetivo">
              Sitio web de e-commerce simple para vender productos
              directamente a clientes locales.
            </Field>
            <Field icon={ListChecks} label="Entregables">
              Landing con catálogo, carrito básico y checkout por WhatsApp.
            </Field>
            <Field icon={ImageIcon} label="Assets necesarios">
              Fotos de producto en alta resolución (pendiente del cliente).
            </Field>
            <Field icon={CalendarClock} label="Deadline">
              Urgente — priorizar entrega en la primera semana.
            </Field>
          </div>
        </div>
      </div>
    </section>
  );
}

function ChatBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-[#dcf8c6] px-3.5 py-2 text-sm text-[#1c2b1c] shadow-sm dark:bg-[#4a5c47] dark:text-[#e6f0e2]">
      {children}
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Target;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
        <Icon className="size-4" />
      </div>
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-sm text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}
