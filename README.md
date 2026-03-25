# Portfolio Website

A personal portfolio site hosted on Cloudflare Pages with a Supabase backend. Consists of two independent React (TypeScript) apps:

- **Public app** — served at `/`, read-only, visible to all visitors
- **Admin app** — served at `/admin/`, gated by a Cloudflare Function, full config editor

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Yarn](https://yarnpkg.com/) 1.x
- A [Supabase](https://supabase.com/) project
- A [Cloudflare Pages](https://pages.cloudflare.com/) project connected to this repository

---

## 1. Supabase Setup

### Create the project

1. Go to [supabase.com](https://supabase.com/) → New project
2. Note your **Project URL** and **anon public key** (Settings → API)

### Run the schema

In the Supabase dashboard → SQL Editor, paste and run the contents of `supabase/schema.sql`.

This is idempotent — safe to run multiple times. It creates:
- The `config` table with RLS policies
- The `portfolio` storage bucket with public read / authenticated write policies
- A seed config row

### Create the admin user

In the Supabase dashboard → Authentication → Users → Invite user (or Add user).
Use email + password. This is the only account that will ever log into `/admin`.

---

## 2. Local Development

```bash
# Install dependencies
yarn --cwd public-app install
yarn --cwd admin-app install

# Run public app (http://localhost:5173)
yarn dev:public

# Run admin app (http://localhost:5174)
yarn dev:admin
```

Create `.env` files for local dev (these are gitignored):

**`public-app/.env`**
```
VITE_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

**`admin-app/.env`**
```
VITE_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

---

## 3. Cloudflare Pages Setup

### Connect the repository

1. Cloudflare dashboard → **Workers & Pages** (left sidebar)
2. Click **Create**
3. On the "Create an application" screen, select the **Pages** tab (not Workers)
4. Click **Connect to Git**
5. Authorise GitHub/GitLab if prompted, then select this repository
6. Click **Begin setup**

### Build settings

These settings go into the **Build settings** step of the Pages project wizard, and can also be changed later under **Settings → Builds & deployments**.

| Setting | Value |
|---|---|
| **Framework preset** | `None` |
| **Build command** | `yarn build:ci` |
| **Deploy command** | *(leave blank — Cloudflare Pages deploys the build output automatically)* |
| **Build output directory** | `dist` |
| **Root directory** | *(leave blank)* |

> **Why `yarn build:ci` and not `yarn build`?**
> Cloudflare Pages only runs `yarn install` at the repository root, which does not install dependencies inside `public-app/` or `admin-app/`. The `build:ci` script installs each workspace's dependencies first, then builds both apps.

### Environment variables

In **Settings → Environment variables**, add the following for both **Production** and **Preview** environments:

| Variable | Where it's used | Value |
|---|---|---|
| `VITE_SUPABASE_URL` | Build-time (both apps) | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Build-time (both apps) | Your Supabase anon/public key |
| `SUPABASE_URL` | Runtime (media CF Function) | Your Supabase project URL |
| `NODE_VERSION` | Build environment | `18` |

> `NODE_VERSION` pins the Node.js version used during the Cloudflare build. Without it Cloudflare may default to an older version.

### Deploy

Push to your connected branch (typically `main`). Cloudflare Pages will automatically build and deploy. You can also trigger a manual deploy from the Pages dashboard.

---

## 4. Architecture Notes

```
/
├── public-app/          # React + TS → builds to dist/
├── admin-app/           # React + TS → builds to dist/admin/
├── functions/
│   ├── admin/[[path]].js   # CF Function: UX auth gate for /admin/*
│   └── media/[[path]].js   # CF Function: Supabase Storage proxy with edge caching
├── supabase/
│   └── schema.sql          # Idempotent DB + storage bootstrap
└── package.json            # Root: orchestrates both builds
```

### Image URLs

Images are always referenced as `/media/<uuid>.<ext>` — never direct Supabase URLs. The media Cloudflare Function proxies to Supabase Storage and caches with `Cache-Control: public, max-age=31536000, immutable`. A new upload generates a new UUID, so cache is never stale.

### Security model

- The `/admin/*` Cloudflare Function is a **UX gate only** — it checks for a session cookie shape and redirects to `/admin/login` if absent. It does not verify the JWT cryptographically.
- Real security is enforced by **Supabase RLS**: anon users can only SELECT from `config`; authenticated users can write. The `portfolio` bucket allows anon read, authenticated write.

---

## 5. Icon Names

The Links editor stores an icon name string (e.g. `Github`, `Twitter`, `Globe`). These must match [Lucide React](https://lucide.dev/icons/) component names exactly (PascalCase). If an icon name doesn't match, it falls back to a generic link icon.
