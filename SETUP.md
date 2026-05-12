# Cumbre — Setup Guide

A clonable white-label brewery management system. Public storefront + ERP-grade admin. One deploy per client.

## Prerequisites

- Node 20+, pnpm 9+
- Neon account (free tier OK) — Postgres serverless
- Vercel account (free tier OK)
- Mercado Pago account [optional, AR only] — to accept real payments
- Resend account [optional] — transactional email
- Replicate account [optional] — FLUX image generation

## Quick start (local dev)

1. **Clone + install**

   ```bash
   git clone https://github.com/martin-minghetti/cumbre.git
   cd cumbre
   pnpm install
   ```

2. **Configure brand**

   Edit `config/brand.ts` with your brewery details.
   Replace `public/logo.svg` with your logo (Phase 8 of the build plan).

3. **Database**

   ```bash
   cp .env.example .env.local
   # Fill in DATABASE_URL (Neon), SESSION_SECRET, CART_SECRET, ORDER_TOKEN_SECRET, OWNER_EMAIL
   openssl rand -hex 32   # use for each *_SECRET
   pnpm db:push
   ```

4. **Create owner user**

   ```bash
   echo "INITIAL_OWNER_EMAIL=owner@example.com" >> .env.local
   echo "INITIAL_OWNER_PASSWORD=changeme123" >> .env.local
   pnpm setup:owner
   # IMPORTANT: remove INITIAL_OWNER_* vars after first login (plaintext password risk)
   ```

5. **Run**

   ```bash
   pnpm dev
   ```

   Visit:
   - http://localhost:3000 (storefront)
   - http://localhost:3000/admin/login

## Deploy to Vercel

```bash
vercel link
vercel integration add neon --plan free_v3
vercel env add SESSION_SECRET production
vercel env add CART_SECRET production
vercel env add ORDER_TOKEN_SECRET production
vercel env add OWNER_EMAIL production
vercel env pull .env.local
pnpm db:push
pnpm setup:owner
vercel deploy --prod
```

## Customizing for a client

| What | Where |
|---|---|
| Brand name, palette, fonts | `config/brand.ts` |
| Initial products and batches | `config/seed.ts` |
| Suppliers and supplies catalog | `config/seed.ts` |
| Shipping zones and pricing | `config/brand.ts` → shipping |
| Logo and favicon | `public/` |
| Product images | `public/products/` |
| Legal copy (ToS, privacy) | `app/(public)/legales/` |

## Payment modes

- `PAYMENT_MODE=simulated` (default if no MP token) — checkout completes without real charge. Use for demos.
- `PAYMENT_MODE=production` — requires `MP_ACCESS_TOKEN` + `MP_WEBHOOK_SECRET`.

## Roles

- **owner** — full admin access
- **cashier** — `/pos` only, can view their own cash session history

## Cost estimate (free tier all-in)

| Service | Free quota | Cumbre fit |
|---|---|---|
| Neon | 0.5 GB storage | ~1 year of orders for a small brewery |
| Vercel | Hobby plan | OK for single-tenant deploy |
| Resend | 100 emails/day | OK for small ops |
| Mercado Pago | $0/month, ~10% per tx (their fee) | AR-only |

Fixed monthly cost: **$0**. Variable: MP fees on real sales.

## Next-step upgrades (post-MVP)

- Replace in-memory rate limiter with Upstash Redis (multi-instance safe).
- Replace `INITIAL_OWNER_*` env vars with `/setup` route that self-destructs after first use.
- Add 2FA for admin.
- Audit log for admin actions.
- Stronger password strength validation in env schema.
