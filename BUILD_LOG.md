# Cumbre — Build Log

Tracking wall-clock activos por hito. Honest tracking, no cherry-picking.

## T-0
2026-05-12 — Brainstorming session + spec approved + Phase 1 plan written.

## Phase 1: Scaffold + Auth + Schema

- **Start:** 2026-05-12
- **End:** 2026-05-12
- **Wall-clock estimate:** 1h
- **Actual:** ~1.5h (con review loops + Web Crypto refactor + Vercel/Neon provisioning)

### Tasks

- [x] Task 1: Project bootstrap (Next 16 + Tailwind v4 + Drizzle deps)
- [x] Task 2: Brand config + layout base
- [x] Task 3: DB schema (14 tables + 9 enums) + Vercel-Neon integration + push
- [x] Task 4: Auth library con TDD (bcrypt rounds=12 + Web Crypto HMAC session)
- [x] Task 5: Login/logout API + middleware con role gating
- [x] Task 6: Setup-owner + seed scripts (idempotent)
- [x] Task 7: README + SETUP + BUILD_LOG + GitHub publish

### Tests

- 9 unit tests (auth lib: 4 hash + 5 session). All passing.

### Highlights

- HMAC session unified with Web Crypto (works in Edge runtime + Node, single source of truth).
- Auth hardened post-review: bcrypt rounds 12, runtime payload guard, polymorphic referenceId comments.
- Schema gained query indexes (orders.customer_id, orders.status, pos_sales.cash_session_id, pos_sales.cashier_id).
- Drizzle config patched to load `.env.local` and run push non-interactively.

### Done criteria met

- `pnpm test` → 9 passed.
- `pnpm typecheck` → clean.
- `pnpm dev` → app boots, brand placeholder renders.
- `curl -X POST /api/auth/login` with owner creds → 200 + cookie.
- `curl /admin` (no session) → 307 redirect to `/admin/login`.
- 14 tables + 9 enums applied to Neon.
- Public repo at https://github.com/martin-minghetti/cumbre.

## Phase 2: Front público navegable

- **Start:** 2026-05-12
- **End:** 2026-05-12 (same session as Phase 1)
- **Wall-clock estimate:** 3h
- **Actual:** ~2h (subagent-driven, mostly mechanical translation from approved mockups)
- **Live URL:** https://cumbre-three.vercel.app

### Tasks

- [x] Task 1: Theme expand (paleta + 3 fonts via next/font/google: Anton + Newsreader + JetBrains Mono)
- [x] Task 2: Seed real con 6 productos + 6 batches + 12 pack_definitions + 13 supplies + 3 suppliers
- [x] Task 3: (public) layout + Nav + Footer + AgeGate (client w/ sessionStorage)
- [x] Task 4: Home page (hero monumental + marquee + intro editorial + featured Cumbres + manifesto + taproom)
- [x] Task 5: Catálogo `/cervezas` (6 productos grid)
- [x] Task 6: PDP `/cervezas/[slug]` (editorial layout, packshot + specs + batch info + tasting)
- [x] Task 7: Static pages (nosotros, visitas, mayorista, legales × 4)
- [x] Task 8: Open-redirect hardening (`lib/safe-redirect.ts` + 5 tests + middleware update)
- [x] Task 9: Production deploy + BUILD_LOG update

### Tests

- 14 unit total: 9 from Phase 1 (auth) + 5 new (safe-redirect). All passing.

### Highlights

- **Design system firmed before code**: alpine editorial logbook direction validated via standalone HTML mockups (home + PDP) before any Next code. Decision: "italic e" cobre swap as signature treatment, mountain silhouette via clip-path, sunrise gradients, batch lot codes as visible editorial data.
- **3 fonts via `next/font/google`**: Anton (display, monumental presence), Newsreader (body, editorial italic accents), JetBrains Mono (technical data). All self-hosted at build time.
- **Tailwind v4 `@theme` tokens**: full palette + fonts exposed as utilities (`bg-accent`, `font-display`, `text-glacier`, etc.) — no Tailwind v3 baggage.
- **Server components by default**: every public page is a Server Component reading directly from Drizzle (no useEffect, no client state). Only AgeGate is `'use client'`.
- **Open-redirect proactive fix**: helper `isSafeRelative` extracted to its own module, used in middleware, 5 unit tests cover scheme/protocol-relative/javascript:/empty cases.
- **Next.js 16.2.6 upgrade**: bumped from 16.0.0 to fix CVE-2025-66478 (caught by Vercel deploy validation).
- **Production-ready deploy**: `vercel deploy --prod` with all env vars (4 secrets + DATABASE_URL) configured in Vercel project. Build time ~30s.

### Done criteria met

- `pnpm test` → 14/14 passing.
- `pnpm typecheck` → clean.
- `pnpm build` → all 13 routes compiled (1 static + 1 dynamic API + 1 dynamic PDP + middleware).
- Production deploy LIVE at https://cumbre-three.vercel.app.
- 11 public routes verified live with HTTP 200:
  - `/`, `/cervezas`, `/cervezas/[slug]` (6 valid slugs)
  - `/nosotros`, `/visitas`, `/mayorista`
  - `/legales/edad`, `/legales/privacidad`, `/legales/terminos`, `/legales/envios`
- Age gate visible on first visit, session-persisted.
- BUILD_LOG.md updated with real wall-clock.

### Out of scope (Phase 3)

- Carrito server-side cookie HMAC + `/api/cart/*` mutations
- Checkout shipping form + Mercado Pago Checkout Pro
- `/api/webhooks/mercadopago` with HMAC verification + idempotency
- `PAYMENT_MODE=simulated` fallback
- Email Resend on order paid
- FIFO stock allocation on webhook
- Tests for FIFO + HMAC webhook signature
- Login page `/admin/login` (consumer of the redirect param fixed proactively in Task 8)

## Phase 3: Carrito + Checkout + Mercado Pago + Email + Admin login

- **Start:** 2026-05-12
- **End:** 2026-05-12 (same session)
- **Wall-clock estimate:** 2-3h
- **Actual:** ~3h (subagent-driven across 15 tasks + 2 unplanned infra fixes — seed stock_movements gap and neon-http → neon-serverless driver swap for TX support)
- **Live URL:** https://cumbre-three.vercel.app

### Tasks

- [x] Task 1: Cart HMAC lib + rate-limit lib (TDD, 13 tests)
- [x] Task 2: Cart API routes (add/update/remove/clear) with rate-limit
- [x] Task 3: Cart page + Nav badge + PDP add-to-cart wire-up
- [x] Task 4: FIFO allocator + stock queries (TDD, 7 tests)
- [x] Task 5: Shipping zones + checkout totals (TDD, 4 tests)
- [x] Task 6: Checkout page UI
- [x] Task 7: order-token + email + order-paid pipeline (TDD with mocked DB, 11 tests)
- [x] Task 8: /api/checkout/start route + MP preference + cart-clear on success
- [x] Task 9: MP webhook with HMAC verify, ts freshness 5min, idempotent apply
- [x] Task 10: Simulated payment flow (approve/reject)
- [x] Task 11: /checkout/exito page with order-token verification
- [x] Task 12: /admin/login page consuming safe-redirect helper
- [x] Task 13: CSP + HSTS + X-CTO + X-Frame-Options security headers
- [x] Task 14: Playwright E2E (5 tests: happy path + 4 security)
- [x] Task 15: BUILD_LOG + production deploy

### Tests

- **55 unit/integration** (14 prior + 41 new)
- **5 Playwright E2E** (happy path purchase journey + tampered token + missing token + admin 307 + open-redirect neutralized)

### Highlights

- Cart cookie HMAC with Web Crypto async (same pattern as session). `MAX_QTY_PER_LINE = 99` clamp.
- Rate-limit in-memory sliding window per IP/user (cart 60/min, checkout 10/5min, simulated 20/min).
- FIFO allocator pure function — TDD-covered for single-batch / split / exact-fit / insufficient / empty / qty=0 / order preservation.
- `applyOrderPaid` pipeline: TX with `SELECT FOR UPDATE` on `batches`, FIFO allocate, insert stock_movements, mark paid. Idempotent via `orders.mp_payment_id` UNIQUE + pg `23505` catch in catch block.
- Simulated mode default (`PAYMENT_MODE=simulated`) enables demos without MP credentials.
- Webhook MP: HMAC `x-signature` verify + `ts` freshness 5min + idempotency through DB UNIQUE.
- Resend graceful fallback: missing `RESEND_API_KEY` logs HTML to console.
- `escapeHtml` server-side covers all 5 chars (`&<>"'`) before interpolation in email templates.
- CSP whitelist MP + Resend + self in prod; dev adds `unsafe-eval` + `ws:` + localhost for Turbopack HMR. HSTS preload-ready (2-year max-age) in prod.
- `/admin/login` consumes `isSafeRelative` from Phase 2 — open-redirect attacks coerced to `/admin`.

### Infra fixes during Phase 3

- **Seed stock_movements gap**: Phase 2 seed inserted batches without emitting positive `stock_movements`, leaving `getBatchesForProductFifo` returning empty and blocking all checkouts. Patched `config/seed.ts` to emit `delta=+unitsProduced, reason='production'` on batch insert + backfilled existing batches via one-off SQL.
- **DB driver swap (neon-http → neon-serverless)**: neon-http doesn't support transactions. Switched to Pool-based `drizzle-orm/neon-serverless` + `ws` for Node runtime. Required for `applyOrderPaid` (TX + `SELECT FOR UPDATE`) and `startCheckout` (order + items TX).

### Done criteria met

- `pnpm test` → 55 passed
- `pnpm test:e2e` → 5 passed (happy path + 4 security)
- `pnpm typecheck` → clean
- `pnpm build` → clean
- Production deploy LIVE at https://cumbre-three.vercel.app
- E2E manual verified on prod: PDP → cart → checkout → simulated approve → exito + DB orders/stock_movements consistent (order #4 paid with simulated-4 + stock movement -1 for batch 1)
- 5 security headers in prod (CSP, HSTS, X-CTO, X-Frame-Options, Referrer-Policy)

### Out of scope (Phase 4+)

- Admin dashboard + KPIs + alertas
- CRUD productos / batches / supplies / suppliers / OCs
- POS + caja diaria + cashier role UI
- Reportes + cron alertas
- Real Mercado Pago integration (gated by adding `MP_ACCESS_TOKEN` + `MP_WEBHOOK_SECRET` and flipping `PAYMENT_MODE=production` — code is already wired)
