# BriefQuick

Herramienta web para freelancers, agencias boutique y creadores de contenido
que transforma requerimientos caóticos de clientes en briefs estructurados y
ejecutables mediante IA (Claude) — no solo genera texto, funciona como un
asistente de onboarding de clientes: acepta texto, notas de voz y PDFs,
repregunta en tiempo real cuando una respuesta es vaga, y termina en una
propuesta comercial firmable o una página de Notion.

## Diferenciales

- **Entrada multimodal**: el cliente puede grabar una nota de voz (se
  transcribe automáticamente con Whisper) o adjuntar PDFs/imágenes; Claude lee
  el PDF directamente (no solo su nombre de archivo).
- **Preguntas dinámicas con IA**: si una respuesta es vaga ("algo moderno"),
  el formulario repregunta en el momento con una pregunta concreta generada
  por Claude, antes de dejar avanzar al cliente.
- **Propuesta comercial firmable**: desde cualquier respuesta procesada se
  genera una propuesta con alcance y precio; el cliente la firma en una
  página pública (firma a mano en un `<canvas>`) y ambas partes obtienen un PDF.
- **Exportar a Notion**: con un token de integración interna (sin OAuth), el
  resumen ejecutivo se envía como una página nueva a la base de datos de
  Notion del usuario.

## Stack

- **Next.js 16** (App Router, Server Actions, TypeScript, Turbopack)
- **Tailwind CSS v4** + componentes propios estilo shadcn/ui (Radix UI + CVA) + Framer Motion
- **Supabase** (PostgreSQL + Auth + Row Level Security + Storage)
- **Stripe** (Checkout + Webhooks) — planes Pro mensual y Lifetime Deal
- **Anthropic Claude API** (`@anthropic-ai/sdk`) — resumen ejecutivo, preguntas
  dinámicas y lectura nativa de PDFs adjuntos
- **OpenAI Whisper** (`openai`) — transcripción de notas de voz (Claude no
  transcribe audio de forma nativa)
- **Notion API** (`@notionhq/client`) — exportación del resumen a Notion
- **@react-pdf/renderer** — exportación de briefs y propuestas a PDF

## Estructura del proyecto

```
app/
  page.tsx                     Landing page (simulador interactivo incluido)
  (auth)/login, /signup        Autenticación con Supabase
  auth/callback                Callback de confirmación de email
  dashboard/                   Panel del usuario (protegido)
    briefs/[id]                Detalle de un brief: bandeja + configuración
    briefs/[id]/submissions/.. Detalle de una respuesta + resumen IA + adjuntos
    proposals/, proposals/[id], proposals/new   Propuestas comerciales
    settings/                  Perfil, marca, integraciones (Notion) y facturación
  b/[id]                       Formulario público para el cliente final (multimodal)
  p/[id]                       Página pública de firma de propuestas
  api/
    generate-summary/          Genera el resumen ejecutivo con Claude
    refine-answer/              Detecta respuestas vagas y genera repreguntas
    stripe/checkout/, stripe/webhook/           Pagos y suscripciones
    submissions/[id]/export-pdf/, export-notion/  Exportar un brief
    proposals/[id]/export-pdf/  PDF de la propuesta (borrador o firmada)
components/
  landing/, auth/, dashboard/, public/, proposals/, pdf/, ui/
lib/
  supabase/ (client, server, admin, middleware, storage)
  anthropic.ts, openai.ts, notion.ts, stripe.ts, constants.ts,
  demo-summary.ts, ltd-seats.ts
supabase/
  schema.sql                   Esquema completo: tablas, RLS, triggers, storage, seed
types/database.ts              Tipos TypeScript del esquema
```

## 1. Requisitos

- Node.js 20+
- pnpm 10+ (`corepack enable` o `npm i -g pnpm`)
- Una cuenta de [Supabase](https://supabase.com)
- Una cuenta de [Stripe](https://stripe.com)
- Una API key de [Anthropic](https://console.anthropic.com)

## 2. Instalación

```bash
pnpm install
cp .env.example .env.local
```

Completa `.env.local` con tus credenciales reales (ver siguientes secciones).

## 3. Configurar Supabase

1. Crea un nuevo proyecto en [supabase.com](https://supabase.com/dashboard).
2. Ve a **Project Settings → API** y copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (mantenla secreta)
3. Ve a **SQL Editor**, pega el contenido completo de
   [`supabase/schema.sql`](./supabase/schema.sql) y ejecútalo (es idempotente:
   si ya lo habías corrido antes, puedes volver a pegar el archivo completo
   sin problema, incluida la sección multimodal/propuestas/Notion agregada al
   final). Esto crea:
   - Tablas `profiles`, `brief_templates`, `briefs`, `submissions`, `subscriptions`
   - `submission_attachments` (notas de voz/PDFs) + el bucket privado de
     Storage `attachments` con su política de subida
   - `proposals` (propuestas comerciales con firma electrónica simple)
   - Columnas `notion_token` / `notion_database_id` en `profiles`
   - Políticas RLS estrictas (cada usuario solo ve sus propios datos)
   - El trigger `handle_new_user` que crea automáticamente un `profile` al registrarse
   - El trigger `enforce_free_plan_brief_limit` (máx. 2 briefs activos/mes en Free)
   - Las 4 plantillas base (Diseño Web, Copywriting, Branding, Video/Reels)
4. (Opcional, recomendado) En **Authentication → URL Configuration**, agrega
   `http://localhost:3000/auth/callback` y la URL de producción a los *Redirect URLs*.
5. Por defecto Supabase exige confirmación de email al registrarse. Puedes
   desactivarlo en **Authentication → Providers → Email** durante desarrollo
   para probar más rápido.

## 4. Configurar Anthropic

1. Genera una API key en [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys).
2. Colócala en `ANTHROPIC_API_KEY`.

El modelo usado es `claude-opus-5` (ver `lib/anthropic.ts`).

> **Nota sobre el simulador de la landing (`/`):** es 100% client-side e
> ilustrativo — usa respuestas de ejemplo predefinidas (`lib/demo-summary.ts`)
> y **no** consume la API de Anthropic, para no exponer costo/abuso a tráfico
> anónimo. El flujo real (formulario público → dashboard) sí llama a Claude.

## 5. Configurar OpenAI (transcripción de notas de voz)

1. Genera una API key en [platform.openai.com/api-keys](https://platform.openai.com/api-keys).
2. Colócala en `OPENAI_API_KEY`.

Se usa únicamente el endpoint de transcripción (Whisper) cuando un cliente
adjunta una nota de voz en el formulario público. Si no configuras esta
variable, el resto de la app sigue funcionando con normalidad — solo la
transcripción de audio quedará deshabilitada (el adjunto de audio se guarda
igual y puedes escucharlo desde el dashboard).

## 6. Notion (opcional, por usuario)

A diferencia de las demás integraciones, esta no lleva variables de entorno
globales: cada freelancer conecta **su propia** cuenta de Notion desde
**Configuración** dentro de la app:

1. Crea una integración interna en [notion.so/my-integrations](https://www.notion.so/my-integrations)
   y copia su secreto (`ntn_...`).
2. En Notion, abre la base de datos donde quieres recibir los briefs → botón
   **"..."** → **Connections** → agrega la integración que acabas de crear.
3. Copia el ID de la base de datos (los 32 caracteres en su URL).
4. Pega ambos valores en Configuración → Integración con Notion, dentro de BriefQuick.

## 7. Configurar Stripe

1. En el [Dashboard de Stripe](https://dashboard.stripe.com/test/apikeys), copia la
   clave secreta de test → `STRIPE_SECRET_KEY`.
2. Ve a **Product catalog → Add product** y crea dos productos:
   - **BriefQuick Pro**: precio recurrente, $12.00 USD / mes → copia el `price_id` en `STRIPE_PRICE_PRO`
   - **BriefQuick Lifetime**: precio único, $49.00 USD → copia el `price_id` en `STRIPE_PRICE_LTD`
3. Configura el webhook:
   - En desarrollo: instala la [Stripe CLI](https://docs.stripe.com/stripe-cli) y ejecuta
     ```bash
     stripe listen --forward-to localhost:3000/api/stripe/webhook
     ```
     Copia el `whsec_...` que imprime en `STRIPE_WEBHOOK_SECRET`.
   - En producción: **Developers → Webhooks → Add endpoint**, apunta a
     `https://tu-dominio.com/api/stripe/webhook` y suscribe los eventos:
     `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.

## 8. Ejecutar en desarrollo

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000).

## 9. Build de producción

```bash
pnpm build
pnpm start
```

## 10. Despliegue (Vercel)

1. Importa el repositorio en [vercel.com/new](https://vercel.com/new).
2. Agrega todas las variables de `.env.example` en **Project Settings → Environment Variables**
   (usa las claves **live** de Stripe en producción).
3. Actualiza `NEXT_PUBLIC_APP_URL` con tu dominio real.
4. Configura el webhook de Stripe de producción apuntando a
   `https://tu-dominio.com/api/stripe/webhook`.
5. Agrega la URL de producción en los *Redirect URLs* de Supabase Auth.

## Notas de arquitectura

- **RLS estricta**: cada tabla en `supabase/schema.sql` tiene políticas que
  restringen el acceso al dueño de los datos. El formulario público (`/b/[id]`)
  lee de la vista `brief_public` (solo columnas no sensibles, solo briefs
  `published`) y puede insertar `submissions` sin autenticación gracias a una
  policy específica; el resto de operaciones (lectura de respuestas, generación
  de resumen IA) requieren sesión y verifican la propiedad del brief.
- **Límite del plan Free**: se aplica en dos capas — a nivel de base de datos
  (trigger `enforce_free_plan_brief_limit`, la fuente de verdad) y en la UI
  del dashboard (barra de progreso + mensaje).
- **Generación de IA**: ocurre automáticamente al enviar el formulario público
  (`app/b/[id]/actions.ts`) y puede regenerarse manualmente desde el dashboard
  vía `app/api/generate-summary/route.ts`. Si Claude falla, la respuesta queda
  en estado `pending` sin bloquear al cliente final.
- **Stripe**: `app/api/stripe/webhook/route.ts` es la única fuente de verdad
  para actualizar `profiles.plan` y `subscriptions`; usa la `service_role` key
  para escribir sin pasar por RLS.
- **Adjuntos multimodales**: el bucket `attachments` es privado. El cliente
  final sube directo desde el navegador (policy de INSERT abierta al bucket),
  pero nadie puede leer los objetos sin pasar por el servidor: el dashboard
  genera signed URLs de corta duración (`lib/supabase/storage.ts`) solo tras
  verificar la propiedad del brief. Las notas de voz se transcriben con
  Whisper y los PDFs se envían completos a Claude como `document` block —
  ambos se incorporan al resumen ejecutivo, no solo se listan como archivos.
- **Preguntas dinámicas**: `app/api/refine-answer/route.ts` es deliberadamente
  público (el cliente final no tiene sesión); por eso valida longitudes
  máximas en el body en vez de solo confiar en autenticación, para acotar el
  costo de abuso.
- **Propuestas y firma**: firmar es una transición de estado hecha por un
  visitante anónimo, así que en vez de una policy de UPDATE compleja en RLS,
  `app/p/[id]/actions.ts` valida en código (`status === 'sent'`) y escribe con
  la `service_role` key. Una propuesta `accepted` es descargable en PDF sin
  sesión (es el comprobante de ambas partes); en cualquier otro estado solo el
  dueño autenticado puede verla.
- **Notion**: integración por token estático (sin OAuth) guardado en
  `profiles.notion_token` — cada usuario crea su propia "internal integration"
  en Notion y la conecta desde Configuración. `lib/notion.ts` detecta
  automáticamente la propiedad de tipo "Título" de la base de datos destino,
  así que funciona con cualquier esquema de base de datos que el usuario ya tenga.
