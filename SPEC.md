# Portfolio Website — Project Specification

## Overview

A personal portfolio website hosted on Cloudflare Pages consisting of two completely independent React applications sharing a single Cloudflare Pages deployment and a single Supabase project.

- **Public app** — served at `/`, visible to all visitors, read-only access to config data
- **Admin app** — served at `/admin`, gated behind Cloudflare Function middleware, full read/write access to config data

The admin allows the owner to control all meaningful content on the portfolio (bio, links, theme, photo) without redeploying.

---

## Repository Structure

The project is a monorepo. Both apps are built independently and their output is merged into a single `dist/` directory that Cloudflare Pages serves.

```
/
├── public-app/          # React app → builds to dist/
├── admin-app/           # React app → builds to dist/admin/
├── functions/
│   ├── admin/
│   │   └── [[path]].js  # Middleware: gates all /admin/* requests
│   └── media/
│       └── [[path]].js  # Proxy: caches Supabase Storage images at edge
├── package.json         # Root: orchestrates both builds
└── SPEC.md
```

Claude Code should decide the internal structure of each app (component hierarchy, hooks, state management, routing, etc.).

---

## Build & Deployment

- Root `package.json` has a single `build` script that builds both apps in sequence
- Public app builds into `dist/`
- Admin app builds into `dist/admin/`
- Cloudflare Pages is configured with:
  - Build command: `npm run build`
  - Output directory: `dist`
- Both Cloudflare Functions live in `functions/` and are automatically picked up by Cloudflare Pages

---

## Supabase Setup

### Database

A single table called `config` with one row representing the entire site configuration:

```
config
├── id         integer, primary key (always 1 — single row)
└── data       jsonb
```

The `data` column holds the full config as a single JSON object:

```json
{
  "bio": {
    "name": "string",
    "tagline": "string",
    "body": "string"
  },
  "links": [
    { "id": "uuid", "label": "string", "url": "string", "icon": "string", "visible": true }
  ],
  "theme": {
    "primaryColor": "string (hex)",
    "backgroundColor": "string (hex)",
    "textColor": "string (hex)",
    "fontFamily": "string"
  },
  "photo": {
    "resourceId": "uuid",
    "url": "string (/media/UUID.ext)",
    "alt": "string"
  }
}
```

Fetching config is always a single query. Saving is always a single update to `id = 1`.

### Row Level Security (RLS)

RLS must be enabled on the `config` table.

| Role            | SELECT | INSERT | UPDATE | DELETE |
|-----------------|--------|--------|--------|--------|
| `anon`          | ✅     | ❌     | ❌     | ❌     |
| `authenticated` | ✅     | ✅     | ✅     | ✅     |

### Storage

A single bucket called `portfolio`.

| Role            | Read (download) | Write (upload/delete) |
|-----------------|-----------------|-----------------------|
| `anon`          | ✅              | ❌                    |
| `authenticated` | ✅              | ✅                    |

### Supabase SQL bootstrap

Claude Code should produce a single `supabase/schema.sql` file that creates the table, enables RLS, defines all policies, creates the storage bucket, and seeds the initial empty config row. This file should be idempotent (safe to run multiple times).

### Authentication

Supabase Auth with email + password. A single admin user — no self-registration. The admin account is created manually via the Supabase dashboard.

---

## Cloudflare Functions

### `/functions/admin/[[path]].js` — Auth Gate

- Intercepts every request to `/admin/*`
- Checks for a `sb-session` cookie (set by the admin React app after login)
- If the cookie is absent or clearly invalid (not a JWT shape): redirect to `/admin/login`
- If the cookie is present: call `context.next()` to serve the static admin app asset
- **This is a UX gate only, not a security boundary.** Real security is enforced by Supabase RLS. The Function prevents unauthenticated users from downloading the admin JS bundle, nothing more.
- Does NOT verify the JWT cryptographically — that would require the Supabase secret and adds fragility
- The `/admin/login` route is always allowed through (no redirect loop)

### `/functions/media/[[path]].js` — Image Cache Proxy

- Intercepts every request to `/media/*`
- Fetches the corresponding asset from Supabase Storage:
  `SUPABASE_URL/storage/v1/object/public/portfolio/PATH`
- Returns the response with `Cache-Control: public, max-age=31536000, immutable`
- Cloudflare's edge caches the image globally — Supabase Storage is only hit once per image per edge location
- The public app and admin app always reference images as `/media/UUID.ext`, never as direct Supabase URLs

### Environment Variables

The following must be set in Cloudflare Pages dashboard (encrypted):

| Variable              | Used by               | Description                        |
|-----------------------|-----------------------|------------------------------------|
| `SUPABASE_URL`        | media Function        | Supabase project URL               |
| `SUPABASE_ANON_KEY`   | public app (build)    | Public read-only key               |

Both apps receive their Supabase credentials at build time via environment variables (e.g. `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). The admin app uses the same anon key — elevated write access comes from the authenticated Supabase session, not a different key.

---

## Public App (`/`)

### Purpose

Display the portfolio to visitors. All content is fetched from Supabase on load. No user interaction beyond clicking links.

### Data Loading

- On mount, fetch the single `config` row from Supabase using the anon key
- While loading: show a skeleton/loading state
- On error: show a graceful fallback (do not crash)

### Theme

- CSS custom properties are defined with sensible default values in the global stylesheet
- Once config loads, override the custom properties dynamically via JavaScript on `:root`
- Visitors see a styled page immediately (defaults), theme updates smoothly without a flash

### Sections

1. **Photo** — profile image loaded from `/media/UUID.ext`
2. **Bio** — name, tagline, body text
3. **Links** — list of links filtered to `visible: true`, each rendered as a styled button/card with icon and label, opening in a new tab

### Constraints

- No frameworks beyond React are required, but Claude Code may choose any it deems appropriate
- No authentication, no forms, no user input
- The anon key is safe to expose in the browser (Supabase's intended use)

---

## Admin App (`/admin`)

### Purpose

Allow the owner to edit all portfolio config and upload photos. Protected by Supabase Auth.

### Routes (client-side)

| Path           | Description                              |
|----------------|------------------------------------------|
| `/admin/login` | Email + password login form              |
| `/admin`       | Dashboard / editor (requires auth)       |

### Authentication Flow

1. User visits `/admin` → Cloudflare Function checks for `sb-session` cookie
2. If absent → redirect to `/admin/login`
3. Login form submits credentials to Supabase Auth
4. On success → Supabase sets session cookie → redirect to `/admin`
5. Admin React app independently validates the session via Supabase client on mount
6. If session is invalid at the app level → redirect to `/admin/login`
7. Logout → call Supabase `signOut()` → clears session → redirect to `/admin/login`

The session cookie name used by the Supabase JS client should be confirmed by Claude Code — it may differ by Supabase client version. The Function should check for whatever cookie name the Supabase client actually sets.

### Editor Sections

All sections are on a single page (no sub-navigation needed). Each section has its own Save button that updates only that section's keys in the config JSON.

#### Bio Editor
- Fields: Name, Tagline, Body (multiline textarea)
- Save updates `data.bio`

#### Links Editor
- Display existing links in a list (drag to reorder encouraged but optional)
- Each link row: Label, URL, Icon (text input for icon name), Visible toggle
- Add new link button (generates a UUID for the link's `id`)
- Delete link button per row
- Save updates `data.links`

#### Theme Editor
- Color pickers for: Primary Color, Background Color, Text Color
- Font Family input (Google Fonts name or system font)
- Live preview panel showing how the public site will approximately look with the chosen values
- Save updates `data.theme`

#### Photo Editor
- Display current photo (if set)
- File input accepting image files (jpg, png, webp)
- On file selected:
  1. Generate a UUID in the browser (`crypto.randomUUID()`)
  2. Determine file extension from the file's MIME type
  3. Upload to Supabase Storage as `UUID.ext` using the authenticated session
  4. If an existing photo is set (`data.photo.resourceId` exists), delete the old file from Supabase Storage
  5. Save `{ resourceId, url: "/media/UUID.ext", alt }` to `data.photo`
- Alt text input
- Upload progress indicator

### Constraints

- Must handle Supabase errors gracefully (show error messages, never silently fail)
- Must show loading/saving states
- No public registration — login only

---

## Security Model

| Threat | Mitigation |
|---|---|
| Unauthenticated admin access | Cloudflare Function redirects before serving JS bundle |
| Authenticated-but-unauthorized writes | Supabase RLS rejects writes without valid session |
| Brute force login | Supabase Auth has built-in rate limiting on auth endpoints |
| Exposed anon key | Anon key is intentionally public; RLS enforces read-only for anon |
| Old images persisting in storage | Admin app deletes old file on new photo upload |
| Stale image cache | New upload = new UUID = new URL = cache never stale |
| Storage bucket abuse | Bucket write requires authenticated session; anon is read-only |

---

## Environment Variables Reference

### Build-time (both apps, set in Cloudflare Pages)

| Variable               | Description                  |
|------------------------|------------------------------|
| `VITE_SUPABASE_URL`    | Supabase project URL         |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key   |

### Runtime (Cloudflare Functions, set in Cloudflare Pages)

| Variable         | Description            |
|------------------|------------------------|
| `SUPABASE_URL`   | Supabase project URL   |

---

## What Claude Code Should Decide

The following are intentionally left to Claude Code's judgment:

- Internal component structure and file organization within each app
- State management approach (Context, Zustand, Redux, etc.)
- Styling approach (CSS modules, Tailwind, styled-components, etc.)
- Whether to use a React router library and which one
- Icon library for link icons
- Form handling library (if any)
- Drag-to-reorder library for links (if implementing reorder)
- Error boundary implementation
- Loading skeleton design
- Whether to split admin editor sections into separate components or pages

---

## Deliverables Checklist

- [ ] `public-app/` — complete React app
- [ ] `admin-app/` — complete React app
- [ ] `functions/admin/[[path]].js` — auth gate middleware
- [ ] `functions/media/[[path]].js` — image cache proxy
- [ ] `supabase/schema.sql` — idempotent bootstrap SQL
- [ ] Root `package.json` with `build` script
- [ ] `README.md` — setup instructions (Supabase project creation, env vars, Cloudflare Pages config, creating the admin user)
