# Project Context

> Read this file before making any non-trivial change. Update the relevant
> section(s) — not the whole file — whenever a change affects architecture,
> stack, data model, routes, env vars, deployment, or a documented decision.
> This file is the source of truth when prior chat history isn't available.

## 1. Application Overview

**Name:** Evangelical Student Fellowship (ESF) website

**Purpose:** Public marketing/ministry site for ESF, an international Christian
student ministry founded in Seoul, Korea in 1976, now also serving a
multi-ethnic ministry in Chicago. Presents the org, publishes weekly
Sunday bulletins and sermons, and lets visitors get in touch or find the
service.

**Target users:**
- Public visitors (prospective/current students, church members) — browse,
  read/download bulletins & sermons, get directions, submit contact form.
- Church admin — publishes weekly bulletins/sermons via Sanity Studio
  (`/studio`), no code access needed for that workflow.

**Core features:**
- Weekly Bulletins & Sermons archive (Sanity-backed, admin self-serve)
- In-browser PDF viewer + download for bulletin/sermon files
- Sunday service info with platform-aware "Get Directions"
- Ministries / Missions / History / Contact pages
- Light/dark theme (light by default)
- Contact form (client-side validated, **not yet wired to a backend**)

---

## 2. Technology Stack

### Frontend
- Framework: Next.js **16.3.1** (App Router, Turbopack)
- Language: TypeScript
- UI: React 19.2.8
- Styling: Tailwind CSS v4 (CSS-variable theme tokens in `app/globals.css`)
- Animation: `motion` (Motion/Framer Motion) — see `components/reveal.tsx`
- Icons: `lucide-react`
- Theme: `next-themes` — light by default, `enableSystem={false}` (does not
  follow OS dark mode; only the explicit toggle changes it)
- PDF rendering: `react-pdf` (wraps `pdfjs-dist`) — client-only

### "Backend"
There is no separate backend service. Next.js Server Components read
directly from Sanity at request time (`lib/sanity/queries.ts`). The only
API route is `app/api/revalidate/route.ts`, a webhook receiver for Sanity's
on-publish notifications.

### CMS / Data
- **Sanity** (`sanity`, `next-sanity`, `@sanity/vision`) — schema-as-code,
  no ORM. Studio embedded in this app at `/studio`
  (`app/studio/[[...tool]]/`, config in `sanity.config.ts`).
- Document types: `bulletin`, `sermon` — see §6.
- File storage: Sanity's own asset CDN (`cdn.sanity.io`) — uploaded `.docx`
  and `.pdf` files live there, not in this repo or on Vercel.

### Infrastructure
- Hosting: **Vercel** (Hobby/free tier), auto-deploys on push to `main`
- Repo: GitHub — `ESF-Admin/esf-website`
- CI/CD: Vercel's own build-on-push (no separate CI pipeline)
- Domain: `esfworld.us` (GoDaddy) — **purchased but not yet connected**;
  live site is currently only reachable at the Vercel-assigned subdomain
- Testing: Playwright (`tests/*.spec.ts`)

---

## 3. Application Architecture

```
Visitor
  ↓
Next.js (Vercel) — Server Components render pages
  ↓
lib/sanity/queries.ts  →  Sanity dataset "production" (CDN-cached, ISR 60s
  ↑                        + tag-based revalidation on publish)
Sanity Studio (/studio, admin-only, authenticated)
```

External integrations:
- **Sanity** — CMS + file storage (see §9)
- **Google Maps** (embed iframe + directions deep links) — no API key, uses
  the free `output=embed` and `maps/dir` URL formats
- **Microsoft Office Online Viewer** — fallback iframe for `.docx` entries
  that don't yet have a PDF uploaded

---

## 4. Frontend Structure

```text
app/
├── page.tsx                 Home (Hero, SundayService, teasers, Mission, Testimonials, ContactCta)
├── bulletins/page.tsx        /bulletins archive (?lang=en|es|fr)
├── bulletins/view/page.tsx   PDF/docx viewer for one bulletin
├── sermons/page.tsx          /sermons archive (mirrors bulletins)
├── sermons/view/page.tsx
├── ministries/page.tsx
├── missions/page.tsx
├── history/page.tsx
├── contact/page.tsx
├── studio/[[...tool]]/       Embedded Sanity Studio
├── api/revalidate/route.ts   Sanity webhook → revalidateTag
├── icon.svg                  Favicon (Next file-convention, auto-wired)
└── layout.tsx                Root layout: fonts, ThemeProvider, metadata

components/
├── nav.tsx                   Pathname-based active links (no hash anchors)
├── section.tsx                Shared section wrapper (title/subtitle/placeholder badge, h1|h2 toggle)
├── document-row.tsx           One bulletin/sermon row (shared by teaser + archive)
├── document-teaser.tsx        Homepage "latest 3" for bulletins/sermons
├── document-archive.tsx       Full /bulletins, /sermons page body
├── document-viewer.tsx        View-page shell: PDF (react-pdf) or Office iframe + Download
├── pdf-viewer.tsx             Renders every PDF page to <canvas> via pdf.js
├── pdf-viewer-lazy.tsx        "use client" boundary — required for next/dynamic ssr:false
├── sunday-service.tsx         Homepage service-time + map + directions section
├── get-directions-button.tsx  Platform-aware Maps deep link (see §11)
├── {ministries,missions,history}-teaser.tsx   Compact homepage previews, link out to full page
├── {ministries,missions,story,contact}.tsx    Full-page content, used only on their own /route
└── nav/footer/hero/mission/testimonials/socials/theme-*  Self-explanatory

lib/
├── content.ts                 All static copy + nav structure (single source of truth)
└── sanity/{client,queries}.ts  Sanity client + getBulletins()/getSermons()

sanity/
├── env.ts                     Reads NEXT_PUBLIC_SANITY_* (non-throwing — see §16)
└── schemaTypes/{bulletin,sermon,shared,index}.ts
```

**Key pattern:** bulletins and sermons share almost all UI/data logic
(`document-*.tsx`, `sanity/schemaTypes/shared.ts`) — when adding a third
weekly-published content type, extend that shared layer rather than copying
the bulletin files.

---

## 5. Backend Architecture

N/A as a separate layer — see §3. The one route handler:

- `POST /api/revalidate` — verifies `SANITY_REVALIDATE_SECRET`, then calls
  `revalidateTag(body._type, "max")` so a Sanity publish/delete shows up on
  the site without waiting for the 60s ISR window or a redeploy.

---

## 6. Data Model (Sanity)

Both types share field definitions via `sanity/schemaTypes/shared.ts`
(`weeklyDocumentFields`, `pdfField`, ordering, preview).

### `bulletin`
| Field | Type | Notes |
|---|---|---|
| `date` | date | Sort key, required |
| `title` | string | required |
| `scripture` | string | optional (blank = upcoming/not preached yet) |
| `locale` | string | `en` \| `es` \| `fr`, required |
| `file` | file | `.docx`, the order-of-service document |
| `pdf` | file | optional; when present, View is instant (canvas render) instead of the slower Office iframe |

### `sermon`
Same fields, plus:
| `speaker` | string | who preached |

`file` here is the full sermon manuscript, not the order-of-service — the
two types represent genuinely different documents for the same Sunday, not
duplicate data.

**Locales:** English has real content (33 bulletins migrated from the prior
site + ongoing weekly uploads). Spanish and French exist in the schema with
zero entries — UI renders an empty state, not an error.

---

## 7. Authentication & Authorization

- **Site visitors:** none — fully public, no accounts.
- **Sanity Studio (`/studio`):** Sanity's own auth (Google/GitHub/email
  login), managed entirely by Sanity — this app has no custom auth code.
  Access is scoped to whoever is invited as a project member in Sanity's
  dashboard.
- **CLI/scripts** (`npm run seed:bulletins`): uses the local machine's
  `sanity login` session token, not a hardcoded credential.

---

## 8. API Structure

Only one custom endpoint:

```
POST /api/revalidate    Sanity → Next.js webhook, revalidates on publish
```

Everything else is Server Component data fetching via
`lib/sanity/queries.ts` (`getBulletins(locale)`, `getSermons(locale)`) —
not a REST/GraphQL API consumed by the frontend.

---

## 9. External Integrations

| Service | Purpose | Notes |
|---|---|---|
| Sanity | CMS + file/asset storage | Project ID `ejhpsslc`, dataset `production` |
| Vercel | Hosting, CI/CD, ISR | Auto-deploys `main` |
| Google Maps | Location embed + directions | Free embed/deep-link URLs, no API key |
| Microsoft Office Online Viewer | `.docx` fallback viewer | Third-party iframe, used only when no PDF is uploaded yet |

---

## 10. Environment Variables

(Names and purpose only — see `.env.local.example` for the current list.)

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project to read/write |
| `NEXT_PUBLIC_SANITY_DATASET` | Sanity dataset (`production`) |
| `NEXT_PUBLIC_SANITY_API_VERSION` | Sanity API version pin |
| `SANITY_REVALIDATE_SECRET` | Verifies the revalidate webhook is really from Sanity |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for metadata/OG tags |
| `NEXT_PUBLIC_ALLOW_INDEXING` | `true` → search engines allowed to index; unset/false → `noindex` (current state, matches the legacy site until `esfworld.us` goes live) |

`.env.local` is gitignored and never committed.

---

## 11. Important Workflows

### Admin publishes a weekly bulletin/sermon
1. Log into `/studio`.
2. Bulletin (or Sermon) → Create new (or edit an existing dated entry).
3. Fill date/title/scripture(/speaker) → upload `.docx` → **also upload a
   PDF** (recommended — makes View instant instead of the slower fallback).
4. Publish → Sanity webhook hits `/api/revalidate` → live within seconds.

### Visitor views a document
`DocumentRow` links to `/{bulletins|sermons}/view?src=...&type=pdf|docx`.
`DocumentViewer` renders `PdfViewer` (canvas, all pages) for PDFs, or the
Office Online iframe for `.docx`-only entries. Download opens the raw file
in a new tab (no forced silent save).

### "Get Directions" (`components/get-directions-button.tsx`)
No web API exists to detect installed apps, so this uses the accepted
industry workaround:
- **iOS:** try `comgooglemaps://` custom scheme; if still on-page ~1.2s
  later (no app handoff happened), fall back to `maps.apple.com`.
- **Android:** `google.com/maps/dir` — Android's App Links hand off to the
  Google Maps app automatically when installed.
- **Desktop:** open a blank tab **synchronously** at click time (required —
  `window.open()` inside an async geolocation callback is popup-blocked),
  then redirect that tab once geolocation resolves (or without an origin
  if it doesn't, letting Google Maps prompt the visitor instead).

---

## 12. Coding Conventions

- All static copy lives in `lib/content.ts` — no hardcoded strings in
  components for anything a non-developer might need to change.
- Shared UI logic gets extracted (`document-*.tsx`, `sanity/schemaTypes/shared.ts`)
  rather than duplicated across bulletins/sermons.
- `Section` (`components/section.tsx`) is the standard page-section
  wrapper — pass `headingLevel="h1"` only on a page where that section is
  the *only* heading (i.e., a dedicated `/route`, not a homepage teaser).
- Client-only browser API usage (geolocation, pdf.js, custom URL schemes)
  is isolated into its own `"use client"` file, not sprinkled into Server
  Components.
- No unused abstractions ahead of need — components are added when a
  second real use case appears, not speculatively.

---

## 13. Security Considerations

- `components/document-viewer.tsx` validates any file URL's hostname ends
  in `.sanity.io` before rendering it (`isTrustedFileUrl`) — prevents the
  viewer route from being used as an open iframe/redirect for arbitrary
  third-party URLs.
- Sanity Studio access is authenticated and scoped to invited project
  members only; the public dataset is read-only from the site's
  perspective (writes only ever happen through authenticated Studio/CLI
  sessions).
- `SANITY_REVALIDATE_SECRET` gates the revalidate webhook so only Sanity
  (or someone with the secret) can trigger a cache purge.
- No secrets in the repo; `.env.local` gitignored.
- Contact form has no backend yet, so there's currently no server-side
  input-handling surface to worry about there (see §16).

---

## 14. Deployment Architecture

- **Hosting:** Vercel, Hobby tier. `git push` to `main` → automatic build
  and deploy.
- **Domain:** `esfworld.us` bought via GoDaddy, DNS not yet pointed at
  Vercel — pending step: Vercel dashboard → Domains → add `esfworld.us` →
  add the given records at GoDaddy → add the new domain to Sanity's CORS
  origins → flip `NEXT_PUBLIC_ALLOW_INDEXING`.
- **Environments:** effectively one (Production) — no separate
  staging/preview Sanity dataset in use yet; Vercel's own PR-preview
  deploys read from the same production Sanity dataset.
- **Rendering:** static generation with ISR (`revalidate: 60`) for
  Sanity-backed content, plus on-demand `revalidateTag` from the webhook.
  Routes that read `searchParams` (`/bulletins`, `/sermons`) render
  dynamically per request.

---

## 15. Important Technical Decisions

**PDF viewing: `react-pdf` (canvas), not an `<iframe>`**
Confirmed on the admin's real iPhone: a PDF loaded into a nested `<iframe>`
only shows page 1 on iOS Safari and never scrolls further — a WebKit
limitation, not a CSS-fixable bug. `react-pdf`/`pdf.js` renders each page
to its own `<canvas>` (plain DOM), which scrolls normally everywhere.
Consequence: pdf.js touches browser-only APIs at module load, so it must
be lazy-loaded via a dedicated `"use client"` boundary
(`pdf-viewer-lazy.tsx`) with `next/dynamic(..., { ssr: false })` — Next 16
rejects `ssr: false` if called directly from a Server Component.

**`next.config.ts` externalizes only `swr`, not all of `sanity`**
An earlier attempt externalized the whole `sanity` package to fix a
Turbopack build crash (swr has no default export under the `react-server`
condition). That "fixed" the build but broke Studio at runtime — an
externalized package resolves its own `require("react")` outside Next's
bundler-aliased React instance, crashing `react-compiler-runtime`.
Externalizing just `swr` avoids the original crash without that side
effect.

**ISR `revalidate: 60` alongside the Sanity webhook**
Pure static generation with no revalidate window meant a statically-built
homepage kept serving whatever it fetched at the last deploy forever —
deleting content in Sanity had no visible effect until a redeploy. The
60s window is a safety net; the webhook (`revalidateTag`) is what makes
publishing feel instant.

**No separate database for files** — Sanity's own asset CDN is the file
store for bulletins/sermons `.docx`/`.pdf`. Future images: use Sanity's
built-in image pipeline (same system). Future video: don't upload raw
video to Sanity — embed a YouTube/Vimeo link instead (streaming,
bandwidth, and transcoding are not things a CMS asset store handles well).

**Hosting: Vercel over a generic host (e.g. Hostinger)** — this app relies
on Next.js-specific behavior (ISR, ISR tag revalidation, Server
Components) that Vercel runs natively with zero config; a generic host
would require hand-building that infrastructure.

---

## 16. Known Limitations

- Contact form (`components/contact.tsx`) validates client-side and shows
  a success state, but does not POST anywhere — marked with a `// ponytail:`
  comment at the exact line to swap in a real endpoint.
- `esfworld.us` is not yet connected — site is only live at the Vercel
  subdomain.
- Search-engine indexing is off (`NEXT_PUBLIC_ALLOW_INDEXING` unset) —
  intentional until the real domain is live.
- Spanish/French bulletins and sermons: schema-ready, zero real content.
- Ministries and Missions pages still show sample/placeholder copy
  (visibly flagged with a "Placeholder content" badge) — pending real
  copy from the admin.
- Below-the-fold content depends on JS (`Reveal`'s `whileInView`
  animation) — with JavaScript disabled, those sections stay at
  `opacity: 0`.

---

## 17. Current Development Status

**Completed:** Home, Bulletins/Sermons (Sanity-backed, weekly admin
workflow live, 33 bulletins migrated), Ministries/Missions/History/Contact
pages, Sunday Service section with directions, light/dark theme, branded
favicon, mobile/tablet responsive pass, PDF viewer fix, Playwright suite.

**In progress / next:** connect `esfworld.us`, wire the contact form to a
real backend, admin to fill in real Ministries/Missions copy and start
publishing Sermons.

**Planned (not started):** image gallery (would reuse Sanity's image
pipeline, no new infra), video embeds (YouTube link pattern, no new infra).

---

## 18. Recent Changes

### 2026-09-01/02
- Fixed the iOS PDF page-1 bug with a `react-pdf` canvas viewer; Download
  now opens in a new tab instead of forcing a silent save.
- Added the Sunday Service homepage section with a platform-aware Get
  Directions button; added the address to `/contact`.
- Full routing rebuild: every nav destination is a real route (no
  `/#hash` anchors); `/ministries`, `/missions`, `/history`, `/contact`
  became standalone pages with homepage teasers linking out.
- Added `sermon` as a second Sanity content type, refactored the shared
  `document-*` component layer so both types (and any future one) reuse
  the same UI/data code.
- Fixed a real bug where deleted/updated Sanity content kept showing on
  the statically-built homepage (missing ISR revalidate window).
- Theme defaults to light regardless of OS preference; replaced the stock
  favicon with a branded one.

**Files/areas most affected:** `components/document-*.tsx`,
`components/pdf-viewer*.tsx`, `components/sunday-service.tsx`,
`components/get-directions-button.tsx`, `sanity/schemaTypes/*`,
`app/{ministries,missions,history,contact}/page.tsx`, `lib/content.ts`,
`components/nav.tsx`.
