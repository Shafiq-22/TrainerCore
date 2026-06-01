# TrainerCore

**TrainerCore** is an all-in-one business management platform for freelance
personal trainers in the **UAE & GCC** market. It brings clients, workout
programming, scheduling, VAT-compliant invoicing and WhatsApp automation into a
single, bilingual (English / Arabic) web app.

Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**,
**shadcn/ui** and **Supabase**, and billed in **AED** with **5% UAE VAT**.

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Local setup](#local-setup)
- [Environment variables](#environment-variables)
- [Supabase setup](#supabase-setup)
- [Seed data](#seed-data)
- [Stripe setup](#stripe-setup)
- [Twilio (WhatsApp) setup](#twilio-whatsapp-setup)
- [Database migrations](#database-migrations)
- [Running locally](#running-locally)
- [Deployment (Vercel)](#deployment-vercel)
- [Pricing](#pricing)
- [Troubleshooting](#troubleshooting)

---

## Features

- **Client management & progress tracking** — profiles, goals, measurements and
  progress photos with charts over time (Recharts).
- **Drag-and-drop workout plans** — multi-week programs built from an exercise
  library, reorderable by drag (dnd-kit), reusable as templates.
- **Scheduling & sessions** — plan sessions, track attendance and keep a clear
  calendar.
- **Tax invoicing in AED** — UAE-compliant tax invoices with **5% VAT** and
  polished PDF export (jsPDF).
- **WhatsApp check-ins** — automated weekly check-ins and reminders via Twilio.
- **Bilingual EN / AR** — full English and Arabic interface with proper
  right-to-left (RTL) layout.
- **Subscription billing** — Starter / Pro / Studio tiers via Stripe, with a
  **14-day free trial**.

> The app is **bilingual**: it ships with both **English** and **Arabic**, and
> the layout switches to **RTL** automatically when Arabic is selected.

---

## Tech stack

| Area              | Technology                                                        |
| ----------------- | ----------------------------------------------------------------- |
| Framework         | [Next.js 14](https://nextjs.org/) (App Router)                    |
| Language          | [TypeScript](https://www.typescriptlang.org/) (strict)           |
| Styling           | [Tailwind CSS](https://tailwindcss.com/)                         |
| UI components     | [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) |
| Backend / DB      | [Supabase](https://supabase.com/) — Postgres, Auth, Storage, RLS  |
| Billing           | [Stripe](https://stripe.com/)                                     |
| Messaging         | [Twilio](https://www.twilio.com/whatsapp) WhatsApp               |
| State             | [Zustand](https://zustand-demo.pmnd.rs/)                          |
| Forms             | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| Charts            | [Recharts](https://recharts.org/)                                |
| PDF generation    | [jsPDF](https://github.com/parallax/jsPDF) + jspdf-autotable     |
| Hosting           | [Vercel](https://vercel.com/)                                    |

---

## Prerequisites

- **Node.js** 18.17+ (Node 20 LTS recommended)
- **pnpm** 8+ (`npm install -g pnpm`)
- A **Supabase** project (free tier is fine)
- *(Optional)* a **Stripe** account for billing
- *(Optional)* a **Twilio** account for WhatsApp messaging
- *(Optional)* the **Supabase CLI** for migrations and type generation

---

## Local setup

```bash
# 1. Install dependencies
pnpm install

# 2. Create your local environment file
cp .env.example .env.local

# 3. Fill in .env.local (see the table below)
#    The app BUILDS and RUNS with the placeholder values — Stripe and Twilio
#    stay safely disabled until you provide real keys.

# 4. Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment variables

Copy `.env.example` to `.env.local` and fill in real values. The app is designed
to **build and run with the placeholder values** — optional integrations stay
disabled until configured.

| Variable                             | Required    | Description                                                                                          |
| ------------------------------------ | ----------- | ---------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`           | **Yes**     | Supabase project URL, e.g. `https://xxxx.supabase.co`.                                               |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`      | **Yes**     | Supabase anon/publishable key. Safe to expose in the browser; protected by RLS.                      |
| `SUPABASE_SERVICE_ROLE_KEY`          | Recommended | Server-only service role key. **Never** expose to the browser. Required for Stripe webhook DB writes; privileged flows otherwise fall back to `SECURITY DEFINER` RPCs. |
| `STRIPE_SECRET_KEY`                  | Optional    | Stripe secret key (`sk_...`). Billing activates when set.                                            |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Optional    | Stripe publishable key (`pk_...`) used by the browser checkout flow.                                 |
| `STRIPE_WEBHOOK_SECRET`              | Optional    | Signing secret (`whsec_...`) for the `/api/webhooks/stripe` endpoint.                                |
| `STRIPE_PRICE_STARTER`               | Optional    | Stripe Price ID for the **Starter** plan.                                                            |
| `STRIPE_PRICE_PRO`                   | Optional    | Stripe Price ID for the **Pro** plan.                                                                |
| `STRIPE_PRICE_STUDIO`                | Optional    | Stripe Price ID for the **Studio** plan.                                                             |
| `TWILIO_ACCOUNT_SID`                 | Optional    | Twilio Account SID (`AC...`). WhatsApp messaging activates when set.                                 |
| `TWILIO_AUTH_TOKEN`                  | Optional    | Twilio auth token.                                                                                   |
| `TWILIO_WHATSAPP_NUMBER`             | Optional    | WhatsApp sender in the form `whatsapp:+14155238886`.                                                 |
| `NEXT_PUBLIC_APP_URL`                | **Yes**     | Public base URL of the deployment (used for links in WhatsApp / check-ins). `http://localhost:3000` locally. |
| `CRON_SECRET`                        | **Yes**     | Shared secret protecting the `/api/cron/*` endpoints. Generate a long random string.                |

---

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com/) and copy the
   **Project URL** and **anon key** into `.env.local`. Copy the **service role
   key** too (Project Settings → API).
2. Apply the database migrations in [`supabase/migrations`](supabase/migrations):

   **Option A — Supabase CLI (recommended):**

   ```bash
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```

   **Option B — Dashboard:** open the **SQL Editor** and run each migration file
   in `supabase/migrations` in numeric order (`0001` → `0007`).

3. **Storage buckets** — `avatars`, `progress-photos` and `invoice-assets` are
   created automatically by migration **`0004_storage.sql`** (along with their
   RLS policies). `avatars` is public; the other two are private and served via
   signed URLs.

4. **Generate TypeScript types** for the database (after linking the project):

   ```bash
   pnpm gen:types
   # runs scripts/gen-types.sh -> writes src/lib/supabase/database.types.ts
   ```

---

## Seed data

Populate the database with a demo trainer, clients, plans and sample data:

```bash
pnpm seed
# runs scripts/seed.ts
```

This creates a demo account you can log in with immediately:

- **Email:** `demo@trainercore.app`
- **Password:** `Demo1234!`

> Seeding requires a working Supabase connection (and `SUPABASE_SERVICE_ROLE_KEY`
> for user creation).

---

## Stripe setup

Billing is **optional** — the app runs without it. To enable subscriptions:

1. In the Stripe Dashboard, create **3 products**, each with a recurring
   **monthly price in AED**:
   - **Starter** — AED 99 / mo
   - **Pro** — AED 199 / mo
   - **Studio** — AED 499 / mo
2. Copy each Price ID into `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO` and
   `STRIPE_PRICE_STUDIO`.
3. Set `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
4. Configure a **webhook endpoint** pointing at:

   ```
   https://<your-domain>/api/webhooks/stripe
   ```

   Subscribe to at least these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

   Copy the endpoint's signing secret into `STRIPE_WEBHOOK_SECRET`.

5. For **local testing**, forward webhooks with the Stripe CLI:

   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

> **Important:** the webhook handler writes subscription state back to the
> database using the Supabase **service role**, so `SUPABASE_SERVICE_ROLE_KEY`
> **must** be set wherever the webhook runs (locally and on Vercel).

---

## Twilio (WhatsApp) setup

WhatsApp messaging is **optional**. Without Twilio credentials, the app **logs
outbound messages to the console and continues** — no errors, nothing is sent.

1. Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` and `TWILIO_WHATSAPP_NUMBER`
   (format `whatsapp:+14155238886`).
2. For development, use the **Twilio WhatsApp Sandbox** and join it from your
   phone.
3. For production, use the **WhatsApp Business API**. Note that production
   sending requires **pre-approved message templates** for the message types you
   send (e.g. check-in reminders).

---

## Database migrations

Migrations live in [`supabase/migrations`](supabase/migrations) and are applied
in numeric order:

| File                             | Purpose                                                       |
| -------------------------------- | ------------------------------------------------------------- |
| `0001_init_schema.sql`           | Core schema — trainers, clients, plans, sessions, invoices.   |
| `0002_functions_triggers.sql`    | Database functions and triggers.                              |
| `0003_rls_policies.sql`          | Row Level Security (RLS) policies for tenant isolation.       |
| `0004_storage.sql`               | Storage buckets (`avatars`, `progress-photos`, `invoice-assets`) and policies. |
| `0005_rpcs.sql`                  | `SECURITY DEFINER` RPCs for privileged flows.                 |
| `0006_security_hardening.sql`    | Additional security hardening.                                |
| `0007_message_templates.sql`     | WhatsApp / check-in message templates.                        |

Apply them with `supabase db push`, or paste each file into the dashboard SQL
editor in order.

---

## Running locally

```bash
pnpm dev        # start the dev server (http://localhost:3000)
pnpm build      # production build
pnpm start      # serve the production build
pnpm lint       # ESLint
pnpm typecheck  # TypeScript type-check (tsc --noEmit)
pnpm seed       # seed demo data
pnpm gen:types  # regenerate Supabase types
```

---

## Deployment (Vercel)

1. Import the repository into [Vercel](https://vercel.com/).
2. Add **all environment variables** from the table above in
   **Project Settings → Environment Variables** (set `NEXT_PUBLIC_APP_URL` to
   your production URL).
3. Deploy. Next.js is detected automatically.
4. **Cron jobs** are configured in [`vercel.json`](vercel.json) and hit the
   `/api/cron/*` endpoints on a schedule. These endpoints are protected by
   `CRON_SECRET`, so make sure that variable is set in your Vercel project.
5. Add your production **Stripe webhook** endpoint
   (`https://<your-domain>/api/webhooks/stripe`) and confirm
   `SUPABASE_SERVICE_ROLE_KEY` is present for webhook DB writes.

---

## Pricing

All plans include a **14-day free trial**. Prices are in **AED** and exclude
**5% VAT** where applicable.

| Plan        | Price (AED / mo) | Clients   | Seats        |
| ----------- | ---------------- | --------- | ------------ |
| **Starter** | 99               | 10        | 1            |
| **Pro**     | 199              | 30        | 1            |
| **Studio**  | 499              | Unlimited | Up to 5      |

---

## Troubleshooting

- **"Email not confirmed" on login.** New sign-ups require email confirmation by
  default. Confirm the address from the email, or disable email confirmation in
  **Supabase → Authentication → Providers → Email** for local development. The
  seeded `demo@trainercore.app` account is created pre-confirmed.
- **Empty data / "row violates row-level security policy".** This usually means
  RLS is doing its job but the request isn't authenticated as the owning trainer.
  Ensure you're logged in, that migrations `0003`/`0006` were applied, and that
  server-side privileged writes use `SUPABASE_SERVICE_ROLE_KEY`.
- **Stripe webhook 400 / signature errors.** Verify `STRIPE_WEBHOOK_SECRET`
  matches the endpoint, and that `SUPABASE_SERVICE_ROLE_KEY` is set so the
  handler can write subscription state.
- **WhatsApp messages aren't sending.** Without Twilio keys the app intentionally
  logs messages and continues. Set the `TWILIO_*` variables, and for production
  ensure your message templates are pre-approved.
- **Placeholder env values in production.** The app runs with the placeholder
  values from `.env.example`, but integrations stay disabled. Replace every
  placeholder with a real value before going live.

---

Built for trainers in the **UAE & GCC** 🇦🇪
