# Cumbre — Brewery E-Commerce + ERP

> Production-grade white-label brewery management system. Public storefront + ERP-lite admin (batch traceability, stock movements, suppliers, purchase orders, POS, cash register, reports). One deploy per client.

Live demo: TBD after first deploy
Setup guide: [SETUP.md](./SETUP.md)
Build log: [BUILD_LOG.md](./BUILD_LOG.md)

## Stack

- Next 16 (App Router, Turbopack) + TypeScript strict
- Tailwind CSS v4
- Drizzle ORM + Neon Postgres serverless
- shadcn/ui (admin + POS only)
- Mercado Pago Checkout Pro
- Resend (transactional email)
- Vitest + Playwright

## Features

- Public storefront with cart, checkout, MP integration
- Production module with batch traceability (lot code, ABV, IBU, cost)
- Stock movements with FIFO allocation per batch
- Suppliers + purchase orders (draft, placed, received, paid)
- POS with cash register (open/close sessions, arqueo)
- Reports: margin, top products, critical stock, sales by period
- Role-based auth (owner / cashier) with bcrypt + signed cookies
- White-label: brand, products, shipping zones in one config file

## License

MIT — fork, deploy, sell installations.
