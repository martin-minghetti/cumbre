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

## Phase 2: Front público + catálogo + checkout
TBD. Plan to be written after Phase 1 cierre review.
