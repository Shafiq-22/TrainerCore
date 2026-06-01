# TrainerCore — Deployment & Live Instance

This instance is wired to a **live Supabase project** that has already been
migrated and seeded. The application code is complete, typechecks, and the
production build (`pnpm build`) passes.

## Live backend (already provisioned)

| Item | Value |
| --- | --- |
| Supabase project ref | `hcumfoytopbrehkdxyqj` |
| Supabase URL | `https://hcumfoytopbrehkdxyqj.supabase.co` |
| Region | `ap-south-1` (Mumbai — closest to UAE/GCC) |
| Migrations | `supabase/migrations/0001`–`0007` (applied) |
| Buckets | `avatars` (public), `progress-photos`, `invoice-assets` (private) |

The publishable URL + anon key are committed in `.env.production` so a Vercel
build connects to this backend out of the box. (The anon key is safe to expose —
it is protected by Row Level Security.)

### Demo login

```
Email:    demo@trainercore.app
Password: Demo1234!
```

Seeded with 5 UAE clients, 50 exercises, 4 plans (3 templates + 1 assigned),
51 measurements, 6 invoices (TC-2026-0001…0006), 10 sessions, 9 check-ins.

## Deploy to Vercel (one-time, ~2 minutes)

The CLI could not be authenticated from the build sandbox (no Vercel token, and
the sandbox network blocks Vercel's host), so the final publish is a quick manual
step:

1. Go to <https://vercel.com/new> and **import** the GitHub repo
   `Shafiq-22/TrainerCore` (branch `claude/keen-euler-mjhv3`).
2. Framework preset **Next.js** is auto-detected. No build settings needed.
3. Click **Deploy**. The build reads `.env.production`, so the app comes up
   connected to Supabase immediately.

That's it — log in with the demo credentials above.

> Already have Vercel git integration on this repo? Then the push that created
> this branch will have triggered a deployment automatically.

## Optional: enable the paid integrations

Everything works without these; they activate when you add the keys as **Vercel
Project Environment Variables** (Settings → Environment Variables), then redeploy.

- **Stripe** (subscriptions, payment links): `STRIPE_SECRET_KEY`,
  `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`,
  `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_STUDIO`.
  Add a webhook endpoint `/api/webhooks/stripe` for
  `checkout.session.completed` and `customer.subscription.*`.
- **Twilio WhatsApp**: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`,
  `TWILIO_WHATSAPP_NUMBER`. Status callbacks hit `/api/webhooks/twilio`.
- **Service role** (for webhook DB writes): `SUPABASE_SERVICE_ROLE_KEY`
  (Supabase → Project Settings → API). Public check-ins already work without it
  via SECURITY DEFINER RPCs.
- **Cron** (`vercel.json` already configured for overdue invoices, reminders,
  weekly check-ins): set `CRON_SECRET` to a long random string.

## Recommended Supabase hardening

In the Supabase dashboard → Authentication → Policies, enable **Leaked password
protection** (HaveIBeenPwned). This is the only outstanding advisory and is a
dashboard toggle.
