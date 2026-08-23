# BriefFast

Herramienta web para freelancers, agencias boutique y creadores de contenido
que transforma requerimientos caóticos de clientes en briefs estructurados y
ejecutables mediante IA (Claude).

## Stack

- **Next.js 16** (App Router, Server Actions, TypeScript, Turbopack)
- **Tailwind CSS v4** + componentes propios estilo shadcn/ui (Radix UI + CVA) + Framer Motion
- **Supabase** (PostgreSQL + Auth + Row Level Security)
- **Stripe** (Checkout + Webhooks) — planes Pro mensual y Lifetime Deal
- **Anthropic Claude API** (`@anthropic-ai/sdk`) — generación del resumen ejecutivo
- **@react-pdf/renderer** — exportación de briefs a PDF

## Estructura del proyecto

```
app/
  page.tsx                     Landing page (simulador interactivo incluido)
  (auth)/login, /signup        Autenticación con Supabase
  auth/callback                Callback de confirmación de email
  dashboard/                   Panel del usuario (protegido)
    briefs/[id]                Detalle de un brief: bandeja + configuración
    briefs/[id]/submissions/.. Detalle de una respuesta + resumen IA
    settings/                  Perfil, marca y facturación
  b/[id]                       Formulario público para el cliente final
  api/
    generate-summary/          Genera el resumen ejecutivo con Claude
    stripe/checkout/           Crea la sesión de Stripe Checkout
    stripe/webhook/            Sincroniza el estado de la suscripción
    submissions/[id]/export-pdf/  Genera el PDF del brief
components/
  landing/, auth/, dashboard/, public/, pdf/, ui/
lib/
  supabase/ (client, server, admin, middleware)
  anthropic.ts, stripe.ts, constants.ts, demo-summary.ts, ltd-seats.ts
supabase/
  schema.sql                   Esquema completo: tablas, RLS, triggers, seed
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
3. Ve a **SQL Editor**, pega el contenido de [`supabase/schema.sql`](./supabase/schema.sql)
   y ejecútalo. Esto crea:
   - Tablas `profiles`, `brief_templates`, `briefs`, `submissions`, `subscriptions`
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

## 5. Configurar Stripe

1. En el [Dashboard de Stripe](https://dashboard.stripe.com/test/apikeys), copia la
   clave secreta de test → `STRIPE_SECRET_KEY`.
2. Ve a **Product catalog → Add product** y crea dos productos:
   - **BriefFast Pro**: precio recurrente, $12.00 USD / mes → copia el `price_id` en `STRIPE_PRICE_PRO`
   - **BriefFast Lifetime**: precio único, $49.00 USD → copia el `price_id` en `STRIPE_PRICE_LTD`
3. Configura el webhook:
   - En desarrollo: instala la [Stripe CLI](https://docs.stripe.com/stripe-cli) y ejecuta
     ```bash
     stripe listen --forward-to localhost:3000/api/stripe/webhook
     ```
     Copia el `whsec_...` que imprime en `STRIPE_WEBHOOK_SECRET`.
   - En producción: **Developers → Webhooks → Add endpoint**, apunta a
     `https://tu-dominio.com/api/stripe/webhook` y suscribe los eventos:
     `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.

## 6. Ejecutar en desarrollo

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000).

## 7. Build de producción

```bash
pnpm build
pnpm start
```

## 8. Despliegue (Vercel)

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
