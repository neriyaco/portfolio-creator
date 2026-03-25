# Implementation Plan

## Status
Last updated: 2026-03-25
Current step: —
Overall progress: 12/12 steps complete ✅

## Tech Decisions
- **Build tool**: Vite 5 (not 6 — v6 native binaries break yarn v1 cache), TypeScript throughout
- **Styling**: Tailwind CSS v3 (not v4 — same lightningcss issue)
- **Icons**: Lucide React
- **Router**: React Router v7 (react-router-dom — same API as v6)
- **State management**: Local component state per editor; each editor calls useConfig() independently
- **Drag-to-reorder**: Not implemented (optional per spec)
- **Form library**: None (native controlled inputs)
- **Package manager**: yarn — install devDeps sequentially per workspace (not in parallel) to avoid cache corruption with yarn v1

---

## Steps

### Step 1: Root Repository Scaffolding
- Status: DONE
- Depends on: none
- What: Root `package.json`, `.gitignore`, top-level directories
- Files touched: `package.json`, `.gitignore`, all top-level dirs
- Notes: Root build script uses `yarn --cwd` pattern. `.gitignore` allows `.env.example`.

---

### Step 2: Supabase Bootstrap SQL
- Status: DONE
- Depends on: none
- What: Idempotent SQL: config table, RLS, storage bucket, policies, seed row
- Files touched: `supabase/schema.sql`
- Notes: Policies dropped+recreated via DO $$ idiom. Bucket is public=true so media proxy can serve without a key. Storage RLS policies on `storage.objects`.

---

### Step 3: Cloudflare Functions
- Status: DONE
- Depends on: none
- What: Admin auth gate + media proxy CF Functions
- Files touched: `functions/admin/[[path]].js`, `functions/media/[[path]].js`
- Notes: Admin gate handles Supabase v2 chunked cookie naming (sb-*-auth-token*) and URL-encoded JSON values. Cookie check is UX gate only — no JWT verification. Media proxy sets `Cache-Control: public, max-age=31536000, immutable`, forwards Range headers.

---

### Step 4: Public App — Project Setup
- Status: DONE
- Depends on: Step 1
- What: Vite + TypeScript + Tailwind + Supabase client for public app
- Files touched: `public-app/package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `tailwind.config.js`, `postcss.config.js`, `src/main.tsx`, `src/index.css`, `src/lib/supabase.ts`
- Notes: All files use `.ts`/`.tsx`. `outDir: '../dist'` so build lands in root dist/.

---

### Step 5: Public App — UI Implementation
- Status: DONE
- Depends on: Step 4
- What: Full public portfolio UI — fetch, skeleton, error, theme apply, Photo/Bio/Links sections
- Files touched: `App.tsx`, `hooks/useConfig.ts`, `components/LoadingSkeleton.tsx`, `ErrorState.tsx`, `PhotoSection.tsx`, `BioSection.tsx`, `LinksSection.tsx`, `LinkCard.tsx`, `types.ts`
- Notes: Dynamic Lucide icon resolution via `import * as LucideIcons` + keyof lookup. Build warning: 1.28 MB chunk due to all-icons import (acceptable for portfolio; could code-split later). CSS custom properties applied to `:root` once config loads.

---

### Step 6: Admin App — Project Setup & Routing
- Status: DONE
- Depends on: Step 1
- What: Vite + TypeScript + Tailwind + React Router v7 + Supabase client + ProtectedRoute
- Files touched: `admin-app/package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `tailwind.config.js`, `postcss.config.js`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/lib/supabase.ts`, `src/components/ProtectedRoute.tsx`
- Notes: `base: '/admin/'`, `outDir: '../dist/admin'`. BrowserRouter `basename="/admin"` so routes work at the subpath. ProtectedRoute subscribes to auth state changes in addition to initial session check.

---

### Step 7: Admin App — Login Page
- Status: DONE
- Depends on: Step 6
- What: Email+password login form, error display, success redirect
- Files touched: `admin-app/src/pages/LoginPage.tsx`
- Notes: Uses `supabase.auth.signInWithPassword()`. Navigates to `/` (which is `/admin/`) on success. Error message from Supabase shown inline.

---

### Step 8: Admin App — Bio Editor
- Status: DONE
- Depends on: Step 6
- What: Bio editor with Name/Tagline/Body fields and save/status feedback
- Files touched: `admin-app/src/components/editors/BioEditor.tsx`, `admin-app/src/hooks/useConfig.ts`
- Notes: `useConfig` hook is shared across all editors and provides `saveSection<K>()` generic. Each editor initializes its own copy of the config state from the same hook.

---

### Step 9: Admin App — Links Editor
- Status: DONE
- Depends on: Step 6
- What: Links list with add/delete/edit/visible toggle and save
- Files touched: `admin-app/src/components/editors/LinksEditor.tsx`
- Notes: UUID generated via `crypto.randomUUID()`. No drag-to-reorder (optional). Grid layout for label/url/icon/visible/delete columns.

---

### Step 10: Admin App — Theme Editor
- Status: DONE
- Depends on: Step 6
- What: Color pickers + font family + live preview panel
- Files touched: `admin-app/src/components/editors/ThemeEditor.tsx`, `admin-app/src/components/ThemePreview.tsx`
- Notes: Each color field has both a `<input type="color">` swatch and a hex text input kept in sync. Preview updates in real time via props.

---

### Step 11: Admin App — Photo Editor
- Status: DONE
- Depends on: Step 6
- What: Photo display, file upload to Supabase Storage, old file deletion, alt text save
- Files touched: `admin-app/src/components/editors/PhotoEditor.tsx`
- Notes: Upload to `portfolio` bucket as `UUID.ext`. On upload, deletes previous file by resourceId. Alt text has a separate Save button. Progress indicator is a simple "Uploading…" state.

---

### Step 12: Admin App — Dashboard Assembly & README
- Status: DONE
- Depends on: Steps 7, 8, 9, 10, 11
- What: Dashboard page composing all editors + logout. README with full setup guide.
- Files touched: `admin-app/src/pages/Dashboard.tsx`, `README.md`
- Notes: `signOut()` then navigate to `/login`. README covers prerequisites, Supabase setup, schema.sql, Cloudflare Pages config, env vars, admin user creation, local dev instructions, icon name format.
