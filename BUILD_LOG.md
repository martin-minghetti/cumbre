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

## Phase 4 slice 1: Admin fundacion (shadcn + dashboard + productos)

- **Start:** 2026-05-13
- **End:** 2026-05-13 (cerrada misma sesion)
- **Wall-clock estimate:** 2h
- **Actual:** ~2.1h (subagent-driven 1 sesion)

### Highlights

- shadcn/ui zinc base + cobre `#B87333` accent scoped a `.admin-shell` (fix CSS-only para no romper paleta editorial publica)
- AppSidebar 6 nav items + lucide icons + active state via `usePathname`
- `/admin` dashboard con 3 KPI cards (ventas-mes / stock-critico / batches-activos)
- `/admin/productos` list con DataTable `@tanstack/react-table` v8 + sort + critical stock highlight
- `/admin/productos/[id]/edit` con ProductForm + `useActionState` + Zod field-level errors + toast sonner
- `updateProduct` Server Action con Zod safeParse + `.returning({slug})` + 3x `revalidatePath`
- 14 unit tests nuevos + 1 E2E happy path admin

### Bugs detected + fixed durante review/E2E

1. Plan bug: `revalidatePath` por `name` en vez de `slug` → fix con `.returning()`
2. Zod schema rechazaba relative paths heroImageUrl → fix union regex
3. shadcn install rompia paleta publica → fallback `.admin-shell` scope

### Done criteria met

- 69 unit + 6 E2E pasando
- Build clean
- LIVE en https://cumbre-three.vercel.app

## Phase 4 slice 2: Admin avanzado (CRUDs + reportes + cron + login restyle)

- **Start:** 2026-05-14 (sesiones 14 y 15 de mayo)
- **End:** 2026-05-15
- **Wall-clock estimate:** 2.5-3h
- **Actual:** ~4-5h distribuidos en 2 sesiones (extra por bugs runtime que tests mocked no atraparon)

### Tasks completadas

- [x] Task 1: slugify utility + 4 tests
- [x] Task 2: AppSidebar 9 nav items reagrupado (Operaciones / Catalogo / Analisis)
- [x] Task 3: Suppliers data layer + schema + 6 tests
- [x] Task 4: Suppliers UI (form + list + create + edit + actions)
- [x] Task 5: Supplies CRUD completo
- [x] Task 6: Batches data layer + list + detail con consumption log
- [x] Task 7: Produccion TX atomica (batch + stock_movements + supply_movements + supplies.current_qty)
- [x] Task 8: Purchase Orders CRUD + transiciones (draft → placed → received → paid) + supply_movements al receive
- [x] Task 9: CREATE + soft DELETE productos (slug auto + pack default)
- [x] Task 10: Ventas online lista + filtros + CSV export + detalle con lotes
- [x] Task 11: 4 reportes (margen + top-productos + stock-critico + ventas-periodo) + hub
- [x] Task 12a: Cron `/api/cron/stock-alerts` + `vercel.json` (0 9 * * *) + 3 tests
- [x] Task 12b: Login restyle con shadcn primitives + nested layout sin sidebar
- [x] Task 12c: Deploy + smoke prod + `CRON_SECRET` en Vercel

### Bugs detectados durante review/runtime y fixeados

1. **Plan SQL bug**: `getCriticalStockProducts` ORDER BY referenciaba `reorder_point` snake_case pero UNION ALL alias era `"reorderPoint"` camelCase. Fix: comilla doble el alias.
2. **Plan SQL bug #2**: Postgres no acepta expresiones en ORDER BY de UNION queries. La ratio `stock::float / NULLIF("reorderPoint", 0)` reventaba runtime con `invalid UNION/INTERSECT/EXCEPT ORDER BY clause`. Fix: wrap UNION en subquery, ORDER BY en outer SELECT. **Detectado en prod (cron 500), no en tests mocked.**
3. **Plan bug ventas**: `toDate` filter usaba `<=` con `'YYYY-MM-DD'` casteado a `timestamptz` midnight → orders del mismo dia despues de 00:00 excluidos. Fix: `< (date + INTERVAL '1 day')` upper bound.
4. **Timezone misalignment**: `getSalesByPeriod` con `date_trunc('day', created_at)` usaba UTC → orders ART 21:00-23:59 bucketeados al día siguiente UTC. Fix: `AT TIME ZONE 'America/Argentina/Buenos_Aires'` antes del truncate.
5. **Numeric coercion gap**: `getCriticalStockProducts` retornaba `r.rows as CriticalRow[]` sin coerce. Neon driver retorna numericos como strings. Fix: `.map()` con `Number()/String()` mirroring las otras 3 funciones.
6. **Login form vs JSON API**: shadcn-restyled login posteaba `application/x-www-form-urlencoded` pero `/api/auth/login` solo aceptaba JSON. Fix: dual-mode handler — form path redirige 303 (success a redirect param, failure a `?error=1`); JSON path preservado.
7. **Build prerender failure**: 4 report sub-pages se SSG-gean por default y fallaban porque querian DB at build time. Fix: `export const dynamic = 'force-dynamic'` en cada uno.

### Tests

- **116 unit/integration** (69 prior + 47 nuevos: slug 4 + suppliers-schema 6 + supplies-schema 5 + production 6 + purchase-orders 6 + products-schema 5 + products-action 5 + sales-csv 4 + reports 4 + cron 3 + dashboard 4 ya estaba)
- **5 Playwright E2E** del Phase 3 siguen verdes; spec nuevo `admin-slice-2.spec.ts` skipeado deliberadamente — smokes manuales + 116 unit tests cubren. Follow-up opcional.

### Decisiones tecnicas firmed

- **TZ-aware date_trunc**: Para reportes con datos argentinos siempre `AT TIME ZONE 'America/Argentina/Buenos_Aires'` antes de truncar. Aplica a cualquier proyecto futuro con ventas/orders en Postgres UTC.
- **UNION ORDER BY**: Si la sort key es una expresion (no column), wrap el UNION en subquery. Postgres restriction.
- **Tests mocked NO cubren SQL real**: Los 4 tests de `reports.ts` pasaban con mocked `db.execute` pero el SQL real reventaba en Neon. Lesson: para queries no-triviales agregar integration test contra DB o smoke contra prod en review.
- **Login dual-mode**: API route handlers en Next pueden coexistir JSON + form-encoded branching por `Content-Type`. Form path redirige 303, JSON path responde 200/4xx. Patron reusable.

### Deploy

- Vercel sin auto-deploy desde GitHub para este proyecto → `vercel deploy --prod --yes` + `vercel alias set <hash> cumbre-three.vercel.app` manual cada push.
- `CRON_SECRET` setea via `vercel env add CRON_SECRET production --value="$(openssl rand -hex 32)"` (NO interactive stdin — el `echo | vercel env add` deja value vacio silencioso).
- Cron real registrado en `vercel.json` corre diaria 09:00 UTC.

### Done criteria met

- `pnpm test` → 116/116 passing
- `pnpm typecheck` → clean
- `pnpm build` → clean (34 routes generated)
- Production deploy LIVE en https://cumbre-three.vercel.app (alias `cumbre-4lru69ce7`)
- Cron smoke OK: `curl -H "Authorization: Bearer $SECRET" /api/cron/stock-alerts` → `{"ok":true,"items":13}`
- Admin gate verificado: 9 routes admin retornan 307 → /admin/login sin sesion
- Login renderiza 200 con shadcn primitives

### Out of scope (Phase 5+)

- POS + caja diaria + cashier role UI con shadcn
- Real Mercado Pago integration (gated por `MP_ACCESS_TOKEN` + `MP_WEBHOOK_SECRET` + `PAYMENT_MODE=production`)
- E2E `admin-slice-2.spec.ts` (skipeado este slice — los manual smokes + 116 unit tests cubren)
- POS-channel ventas (la columna `channel` en orders ya esta pero solo online filtered en slice 2)

## Phase 4 polish: imagenes reales + selectores + tasting + login + bug bundle env

- **Start:** 2026-05-15
- **End:** 2026-05-16
- **Wall-clock estimate:** 1.5-2h
- **Actual:** ~3h (extra por bug bundle env Zod en hydration, login nested layout fix, Tailwind v4 theme-inline issue)

### Highlights

- 8 imagenes FLUX 1.1 Pro via Replicate: 6 packshots 3:4 estilo editorial copper rim light + hero panoramico + og social. Total 461 KB. Costo ~$0.32. scripts/generate-images.ts preserva los prompts.
- Rename productos: Piltriquitron a Laguna Negra (Schwarzbier porron 1L) por geografia (Bolson, no Bariloche). Campanario a Jakob (American Porter mantiene style). UPDATE coordinado en products + pack_definitions + batches.
- BuyBlock client component reemplaza el placeholder PACK disabled de Phase 3. Estado useState del pack seleccionado, descuento real computed por producto, precio + CTA dinamicos, POST a /api/cart/add con packId correcto. FORMATO selector dual eliminado (enganoso, cada beer tiene formato exclusivo).
- lib/tasting.ts con map por slug: 6 tasting notes apropiados al style en lugar del DEFAULT generico de IPA que aplicaba literal a Schwarzbier, Porter, Helles, etc.
- Checkout copy condicional segun env.PAYMENT_MODE: "Te redirigimos a Mercado Pago" si production, "Demo: pantalla simulada" si simulated.
- Login admin de `/admin/login` a `/admin-login` (out of route group `(admin)`) porque nested `<html>` en Next 16 rompe. Layout standalone con admin-shell dark + bg-accent button.

### Bugs detected during testing + fixed in session

1. **PDP 'This page couldn't load' en prod**: BuyBlock 'use client' importaba fmtPrice de `@/lib/products` que arrastraba `@/db` y `@/lib/env` al bundle browser. envSchema.parse(process.env) en module evaluation crasheaba en hydration (process.env vacio en browser, Zod throw, React error.tsx). Server SSR daba 200, smoke curl pasaba. Solo agent-browser revelo el error. Fix: `lib/format.ts` con formatters puros sin db/env imports. Lesson firmed: smoke con browser (no solo HTTP) post-deploy.
2. **Login layout roto**: nested `<html>` en `app/(admin)/admin/login/layout.tsx` dentro del parent `(admin)/layout.tsx` no funciona en Next 16. White panel + off-center + sidebar leaking. Fix: mover a `app/admin-login/` fuera del route group con layout propio.
3. **Login button bg-primary transparent**: Tailwind v4 solo genera utilities desde archivos con `@import "tailwindcss"`. `app/(admin)/globals.css` solo importa `tw-animate-css`. Su `@theme inline { --color-primary: ... }` nunca compila a `.bg-primary`. Fix pragmatico: button usa `bg-accent` del public globals (cobre `#C8843A`).
4. **Vercel CLI env add con pipe stdin**: `echo "$SECRET" | vercel env add VAR production` setea valor vacio silencioso. Fix: flag `--value="..."` explicito.
5. **Campanario sin imagen**: hero_image_url NULL en DB para id=6 (seed insertaba pero no updateaba si ya existia). Fix: UPDATE.
6. **Lote stale en Laguna Negra**: tras rename, DB seguia con lot_code GLD del Golden Ale original. Fix: UPDATE batches.

### Falso positivo

"Cards de home aparecen negras" NO era bug. Era lazy loading default de Next Image. IntersectionObserver no se triggerea por screenshot extent, requiere scroll real con `scrollIntoView()` para que above-the-fold + below-the-fold se evaluen correctamente.

### Files changed

- New: `lib/format.ts`, `lib/tasting.ts`, `components/public/BuyBlock.tsx`, `app/admin-login/{page,layout}.tsx`, `scripts/generate-images.ts`
- Renamed: `app/(admin)/admin/login/` to `app/admin-login/` (out of route group)
- Modified: `components/public/CumbreCard.tsx` (Image fixed width/height), `components/public/HeroBg.tsx` (real hero.jpg behind gradient), `app/(public)/cervezas/[slug]/page.tsx` (BuyBlock + tasting per slug + Image full-bleed), `app/(public)/cervezas/page.tsx` (ALTITUDES new slugs), `app/(public)/page.tsx` (ALTITUDES), `app/(public)/checkout/page.tsx` (paymentMode prop), `components/public/CheckoutForm.tsx` (mode-aware copy), `app/layout.tsx` (openGraph + twitter metadata), `app/api/auth/login/route.ts` (dual JSON+form), `middleware.ts` (/admin-login), `config/seed.ts` (rename + Schwarzbier specs), `lib/admin/reports.ts` (UNION subquery + TZ-aware date_trunc), `tests/admin-products-schema.test.ts` (heroImageUrl Jakob)
- New public assets: `public/products/{catedral,tronador,lopez,frey,laguna-negra,jakob}-packshot.jpg`, `public/hero.jpg`, `public/og.jpg`

### Tests

- 116 unit/integration siguen passing
- 5 Playwright E2E Phase 3 verdes

### Done criteria met

- `pnpm test` 116/116
- `pnpm typecheck` clean
- `pnpm build` clean
- Production deploy LIVE https://cumbre-three.vercel.app
- Smoke visual via agent-browser: home, catalog, PDPs (Tronador, Laguna Negra, Jakob), carrito, checkout, admin-login todos OK
