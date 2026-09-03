# EvTag — Persian Handmade Jewelry Store (اوتاگ)

A single-vendor Persian handmade jewelry storefront: classic silver pieces, one-of-a-kind
exclusive works, a portfolio of past works, and a multi-product package section.

> **This is a public demo.** The admin panel runs in **read-only** mode so visitors can
> explore the dashboard, finance hub, orders, and catalog without anyone being able to
> alter the data. All storefront features work: browse, search, cart, simulated checkout.

## ✨ Live Demo

| | |
|---|---|
| **Storefront** | 🔗 *paste your live URL here* |
| **Admin (read-only)** | `/admin` (dashboard, finance, orders, catalog) |
| **Demo admin login** | `admin` / `evtag-demo-2026` |

> **Read-only is enforced on the server** (see `server/middleware/demo.ts`): with
> `DEMO_MODE=true`, every write to `/api/admin/**` is rejected with a `403`, and the
> write buttons are hidden in the UI. Nobody can edit products, packages, posts, orders,
> or upload images. Visit checkout still completes with `DEMO_PAYMENT=true` (orders are
> flagged paid instantly, no real money moves).

## Features

- **Storefront** — catalog grid with category filter, search, in-stock filter, quick-buy
- **Products** — variants (size / chain length), stock, exclusive (one-of-a-kind) badge
- **Packages** — multi-product sets with bundling
- **Portfolio** — gallery of past works (featured flag)
- **Blog** — Markdown posts with SEO + JSON-LD
- **Cart** — guest cart persisted to `localStorage`
- **Checkout** — OTP (Kavenegar SMS, dev fallback prints code), Zarinpal payment
  (sandbox / demo instant-pay), order success/failure pages
- **Admin** — dashboard, finance, orders, products/packages/portfolio/posts CRUD
- **SEO** — per-page meta, Product JSON-LD, `sitemap.xml` + `robots.txt`

## Stack

Nuxt 4 (Vue 3 + TypeScript) · Tailwind CSS (RTL, Vazirmatn + Markazi Text/Cinzel) ·
Pinia · PostgreSQL (Prisma) · Zarinpal (payment) · Kavenegar (SMS OTP).

## Local development

```bash
# 1. Install dependencies (generates the Prisma client)
npm install

# 2. Configure environment
cp .env.example .env
#    Fill in DATABASE_URL (see step 3), and optionally ADMIN_PASSWORD.

# 3. Start a local PostgreSQL (easiest: Prisma's bundled dev server)
npx prisma dev
#    It prints a URL like: postgres://postgres:postgres@localhost:PORT/template1
#    Put that URL in .env as DATABASE_URL (change the db name to jewelry_store).

# 4. Create the schema and seed demo content (products, packages, admin, blog, demo orders)
npx prisma migrate dev
npx prisma db seed
# 5. Run the dev server
npm run dev
#    → http://localhost:3000
```

**Admin panel:** http://localhost:3000/admin — login `admin` / `admin1234`
(set `ADMIN_PASSWORD` in `.env` **before** seeding to use your own password).

**Dev quick-login:** in development the login page shows a one-click "ورود با کاربر پیش‌فرض"
button (and the default credential hint). It calls a dev-only endpoint (`/api/admin/auth/dev-login`)
and is disabled outside development. Make sure the DB is seeded so the admin exists.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | dev server |
| `npm run build` | production build (SSR) → `.output/` |
| `npm run build:static` | static (SSG) build → `.output/public` (for GitHub Pages) |
| `npm run preview` | preview the production build |
| `npm run typecheck` | type-check (`nuxt typecheck`) |
| `npm test` | unit tests (Vitest) |
| `npm run seed` | re-seed the demo catalog |
| `npm run db:migrate` | apply migrations (`prisma migrate deploy`) |
| `npm run db:setup` | migrate + seed (one-time cloud setup) |

## Deploy as a public demo (free)

> GitHub Pages only serves static files and **cannot run** the Nuxt server, the Prisma
> database, or the Zarinpal/Kavenegar calls. To show a *working* demo you need a free
> host that can run the full stack. Two easy options:

### A. Vercel + Neon (recommended — fastest, no cold starts)

1. **Make the repo public** on GitHub.
2. **Create a free [Neon](https://neon.tech) Postgres** → copy its connection string.
3. **Import the repo in [Vercel](https://vercel.com)** (Nuxt 4 is auto-detected —
   no static config needed).
4. Add these **environment variables** in Vercel (Project → Settings → Environment):

   ```
   DATABASE_URL      = <Neon pooled connection string, e.g. ...-pooler...?sslmode=require>
   DEMO_MODE         = true
   DEMO_PAYMENT      = true
   ZARINPAL_SANDBOX  = true
   ZARINPAL_MERCHANT_ID = 00000000-0000-0000-0000-000000000000
   ADMIN_SESSION_SECRET = <openssl rand -hex 32>
   ADMIN_PASSWORD    = <demo password, e.g. evtag-demo-2026>
   DEMO_ADMIN_USER   = admin
   DEMO_ADMIN_PASSWORD = <same as ADMIN_PASSWORD, so the login page shows it>
   ```

5. **Deploy** the first build. Then run the one-time DB setup (apply schema + load demo
   data). Easy way — install the Prisma CLI and run against the Neon URL:

   ```bash
   DATABASE_URL="<Neon URL>" npx prisma migrate deploy
   DATABASE_URL="<Neon URL>" npx prisma db seed
   ```

   (Or use `npm run db:setup` with `DATABASE_URL` exported.)

6. Paste the new URL into the **Live Demo** table above, and share it!

### C. GitHub Pages (fully static, no database)

For a version that needs **no server or database at all**, the storefront can be baked
into a static site and hosted on **GitHub Pages**. The catalog is served from a
self-contained snapshot (`server/data/staticCatalog.ts`) that mirrors the seed data, so
the build and the resulting site need **no Postgres** at build time or at runtime. Cart,
search, filters, and a **simulated checkout** (no real SMS/payment) all work.

1. **Enable GitHub Pages** on the repo (Settings → Pages → Source → **GitHub Actions**).
2. The `.github/workflows/deploy-pages.yml` workflow builds `npm run build:static` and
   publishes `.output/public` to Pages on every push to `main`.
3. The base path is set by `NUXT_APP_BASE_URL` (default `/Jeweley-project-DEMO/` — change
   it to `/your-repo-name/` if you rename the repo).

The static build is **gated behind `NUXT_STATIC=true`** (set only in the Actions workflow),
so pushing these changes to the repo does **not** affect the full-stack Render/Vercel
deploy, which continues to run SSR from the `package.json` build script.

The **admin panel is a per-browser sandbox** — visit `/admin` to explore it. It's
auto-authenticated and fully interactive: a visitor can add/edit/delete products,
packages, portfolio, and blog posts, and change order statuses. Every change is stored
in **that visitor's own `localStorage`** and survives a reload, so they see a live shop
(edit a product and it updates their storefront too). Changes are **isolated** — they
never affect other visitors, any server, or a database — and a "بازنشانی به دادهٔ اصلی"
button restores the original baked data.

### B. Render Blueprint (one-click, includes free Postgres)

`render.yaml` is already in the repo. In [Render](https://render.com) → **New → Blueprint**
→ point at this repo. It provisions a free web service **and** a free Postgres, and wires
the env vars. After the first deploy, run the same one-time `prisma migrate deploy` +
`prisma db seed` against the DB.

> **Troll-safety:** in the demo the admin is read-only at the server (all writes return
> `403`) and checkout uses instant demo payment. If you ever want to disable checkout as
> well, set `DEMO_PAYMENT=false` (visitors then can't submit orders).

### Private / production use

For your own back-office (not publicly advertised), leave `DEMO_MODE=false`, and set a
real `ZARINPAL_MERCHANT_ID`, `ZARINPAL_SANDBOX=false`, a real `KAVENEGAR_API_KEY`, a
strong `ADMIN_SESSION_SECRET`, and a private `DATABASE_URL`. This enables full admin CRUD.

---

**Brand:** EvTag (اوتاگ) — *one of a kind*. Every piece, silver and crystal — unique.
