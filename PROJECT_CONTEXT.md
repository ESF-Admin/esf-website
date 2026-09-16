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
- Contact form (validated, emails via Resend, honeypot + rate-limited)

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
directly from Sanity at request time (`lib/sanity/queries.ts`). Two API
routes: `app/api/revalidate/route.ts` (Sanity webhook → cache purge) and
`app/api/contact/route.ts` (contact form → Resend email, no DB storage).

### CMS / Data
- **Sanity** (`sanity`, `next-sanity`, `@sanity/vision`, `@sanity/image-url`) —
  schema-as-code, no ORM. Studio embedded in this app at `/studio`
  (`app/studio/[[...tool]]/`, config in `sanity.config.ts`).
- Document types: `bulletin`, `sermon`, `siteSettings` (singleton),
  `navigation` (singleton), `homePage` (singleton), `page` (six documents,
  one per slug: ministries/missions/history/contact/bulletins/sermons),
  `ministry`, `missionCountry`, `testimonial` (repeatable) — see §6.
  **Whole-site CMS migration in progress** (Phase 0 + 1 + 2 + 3 landed
  2026-09-15) — see §15 "CMS content migration" and §17/§18.
- Queries use `defineQuery` (from `next-sanity`) + Sanity TypeGen: run
  `npm run sanity:typegen` after any schema change to regenerate the
  committed `sanity.types.ts` (extracts `schema.json` first, gitignored).
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
  ↑                        + tag-based revalidation on publish) — briefly
  ↑                        made private 2026-09-03, reverted back to
  ↑                        public same window (see §16)
Sanity Studio (/studio, admin-only, authenticated)
```

External integrations:
- **Sanity** — CMS + file storage (see §9)
- **Resend** — contact form email delivery (see §9)
- **Google Maps** (directions deep links only, no embedded preview) — free
  `maps/dir` URL format, no API key
- **Microsoft Office Online Viewer** — fallback iframe for `.docx` entries
  that don't yet have a PDF uploaded

---

## 4. Frontend Structure

```text
app/
├── page.tsx                 Home (Hero, SundayService, teasers, Mission, Testimonials, ContactCta) — reads getHomePage()/getSiteSettings() for JSON-LD
├── bulletins/page.tsx        /bulletins archive (?lang=en|es|fr) — generateMetadata() + getPage("bulletins")
├── bulletins/view/page.tsx   PDF/docx viewer for one bulletin
├── sermons/page.tsx          /sermons archive (mirrors bulletins) — generateMetadata() + getPage("sermons")
├── sermons/view/page.tsx
├── ministries/page.tsx       generateMetadata() + getPage("ministries")
├── missions/page.tsx         generateMetadata() + getPage("missions")
├── history/page.tsx          generateMetadata() + getPage("history")
├── contact/page.tsx          generateMetadata() + getPage("contact")
├── studio/[[...tool]]/       Embedded Sanity Studio
├── api/revalidate/route.ts   Sanity webhook → revalidateTag
├── icon.svg                  Favicon (Next file-convention, auto-wired)
└── layout.tsx                Root layout: fonts, ThemeProvider; generateMetadata() reads siteSettings.defaultSeo

components/
├── nav.tsx                    Async server wrapper: fetches CMS nav/settings, renders NavClient
├── nav-client.tsx              "use client" — all interactive nav behavior; pure props, no data fetching
├── footer.tsx                 Async server component — reads getSiteSettings()/getNavigation()
├── hero.tsx                    Async server wrapper: fetches getHomePage().hero, renders HeroClient
├── hero-client.tsx              "use client" — hero motion/layout; pure props, no data fetching
├── mission.tsx                 Async server component — reads getHomePage().mission
├── contact-cta.tsx             Async server component — reads getHomePage().contactCta
├── section.tsx                Shared section wrapper (title/subtitle/placeholder badge, h1|h2 toggle)
├── document-row.tsx           One bulletin/sermon row (shared by teaser + archive)
├── document-teaser.tsx        Homepage "latest 3" for bulletins/sermons
├── document-archive.tsx       Full /bulletins, /sermons page body
├── document-viewer.tsx        View-page shell: PdfView (PDF) or Office iframe + Download
├── pdf-view.tsx                Picks native <iframe> (desktop) vs canvas (mobile) — see §11/§15
├── pdf-viewer.tsx             Renders every PDF page to <canvas> via pdf.js — mobile only
├── pdf-viewer-lazy.tsx        "use client" boundary — required for next/dynamic ssr:false
├── sunday-service.tsx         Async server component — reads getSiteSettings() (org.address/mapUrl, service.*)
├── get-directions-button.tsx  Platform-aware Maps deep link (see §11)
├── ministries.tsx, missions.tsx, story.tsx  Full-page bodies — props-driven, no data fetching of their own
├── contact.tsx                 ContactSection — title/subtitle are props (Phase 2); org/socials still content.ts-direct (Phase 1 trim, unchanged)
├── testimonials.tsx             Async server wrapper: fetches getHomePage().testimonials + getTestimonials(), renders TestimonialsClient
├── testimonials-client.tsx      "use client" — carousel state/motion; pure props, no data fetching
├── {ministries,missions,history}-teaser.tsx   Async server components — read getPage()/getMinistries()/getMissionCountries() so teasers can't drift from their full page
└── socials/theme-*  Self-explanatory, still content.ts-driven

lib/
├── content.ts                 All static copy + nav structure — the typed
│                               *fallback defaults* content merges over (see
│                               §15, "CMS content migration"); also
│                               `pageSeoDefaults` (per-page <title>/description fallback)
├── icon-map.ts                 ICON_NAMES (string allowlist, imported by the ministry
│                               schema) + iconFor() (the only place a `ministry.icon`
│                               string becomes a lucide component)
└── sanity/
    ├── client.ts               getSanityClient() — memoized, null when unconfigured
    ├── queries.ts              defineQuery GROQ + sanityFetch(); getSiteSettings(),
    │                           getNavigation(), getHomePage(), getPage(slug, fallback),
    │                           getMinistries(), getMissionCountries(), getTestimonials()
    └── defaults.ts             withDefaults(fallback, doc) — CMS-over-default merge

sanity/
├── env.ts                     Reads NEXT_PUBLIC_SANITY_* (non-throwing — see §16)
├── structure.ts                Custom Studio sidebar + SINGLETON_TYPES lock list
│                               (siteSettings, navigation, homePage, page — locked;
│                               ministry/missionCountry/testimonial are NOT locked —
│                               genuinely repeatable, admin creates/deletes freely)
└── schemaTypes/
    ├── {bulletin,sermon,siteSettings,navigation,homePage,page,ministry,testimonial,missionCountry,shared,index}.ts
    └── objects/{ctaObject,seoObject,imageWithAlt,socialLink,navItem,richText}.ts

scripts/
├── seed-bulletins.ts           One-time: migrates 33 hand-sourced bulletins
└── seed-content.ts             Seeds every CMS document (singletons, the six
                                 pages, and the repeatable ministry/testimonial/
                                 missionCountry documents) from lib/content.ts
                                 (npm run seed:content — idempotent)
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

### `siteSettings` (singleton, `_id: "siteSettings"`)
Org contact details + Sunday service info + small chrome text. Every field
has a `lib/content.ts` fallback (via `withDefaults()`) so the site renders
identically whether or not this document exists yet.

| Field | Type | Notes |
|---|---|---|
| `orgName`, `shortName`, `legalFooterName` | string | Full name, short form ("ESF"), footer copyright name |
| `phone` / `phoneHref` | string | Display text / `tel:` link (href-allowlisted) |
| `email` / `emailHref` | string | Display text / `mailto:` link (href-allowlisted) |
| `address` | string | Street address |
| `mapUrl` | string | Google Maps link (href-allowlisted) |
| `copyrightYear` | number | Footer copyright year |
| `serviceDay`, `serviceTime`, `serviceNote` | string | Sunday service section |
| `footerBlurb` | text | Footer description under the logo |
| `navCtaLabel` | string | "Get in touch" button label (nav + mobile menu) |

Not yet CMS-driven: `socials` (still `lib/content.ts`'s `socials` array,
read directly by `components/socials.tsx` — deferred since it's also used
by `components/contact.tsx`, out of Phase 1's scope; see §17).

### `navigation` (singleton, `_id: "navigation"`)
One field, `items[]` of the `navItem` object (label, href, and either a
manual `children[]` list or a `childSource` value). **Phase 1 uses manual
children only** — `childSource` values like `"missionCountries"` or
`"ministries"` exist on the schema for a later phase to auto-generate a
dropdown from real `ministry`/`missionCountry` documents (once those
exist); until then editors maintain the children list by hand, and the
query layer doesn't resolve `childSource` at all. If the whole `items`
array is missing/empty, `getNavigation()` falls back to `lib/content.ts`'s
`navLinks` wholesale (not a field-by-field merge — see
`lib/sanity/queries.ts`).

### `homePage` (singleton, `_id: "homePage"`)
The homepage's hero, mission statement, closing contact CTA, and the
Student Stories section's heading + placeholder toggle (the stories
themselves are separate `testimonial` documents — see below). Every field
falls back to `lib/content.ts`'s `hero`/`mission`/`testimonials` consts
(and a literal default for `contactCta`) via `withDefaults()`.

| Field | Type | Notes |
|---|---|---|
| `hero.eyebrow`, `.title`, `.body` | string/text | Headline's last word is highlighted client-side |
| `hero.primaryCta`, `.secondaryCta` | `cta` object | Label + href (href-allowlisted) |
| `mission.title`, `.statement` | string/text | The homepage's mission-statement band |
| `contactCta.title`, `.subtitle`, `.cta` | string/text/`cta` | Closing homepage CTA (was hardcoded in `contact-cta.tsx` before Phase 2) |
| `testimonials.title`, `.subtitle` | string/text | "Student Stories" section heading |
| `testimonials.showPlaceholderBadge` | boolean | Real toggle as of Phase 3 (was hardcoded `true` before) |

### `page` (six documents, `_id: "page.<slug>"`)
One type for every simple content page — `ministries`, `missions`,
`history`, `contact`, `bulletins`, `sermons` — rather than six near-
identical singletons. Shared fields (`eyebrow`, `title`, `intro`, `seo`)
come from `pageCopyFields()` in `sanity/schemaTypes/shared.ts`; each
page's extra fields are hidden in Studio unless editing that page (see
`onlyFor()` in `sanity/schemaTypes/page.ts`):

| Slug | Extra fields |
|---|---|
| `ministries` | `showPlaceholderBadge` (boolean, real toggle as of Phase 3) — the list itself is now `ministry` documents, not an inline field (Phase 2 had an inline `items[]`, unset by the Phase 3 seed script) |
| `missions` | `showPlaceholderBadge` — the list itself is now `missionCountry` documents (Phase 2's inline `countries[]` likewise unset) |
| `history` | `paragraphs[]` (text), `milestones[]` (year, title, body) |
| `contact` | none — org/socials come from `siteSettings`, not this doc |
| `bulletins`, `sermons` | `tabsLabel`, `emptyText` (archive-page-only strings, distinct from the homepage teaser's `lib/content.ts` `bulletins`/`sermons` consts, which stay separate — see §16) |

`slug` is `readOnly` in Studio and drives which page a document is; every
document is fetched with `getPage(slug, fallback)`, a field-by-field merge
over a caller-supplied fallback shaped like that page's current
`lib/content.ts` values.

### `ministry`, `missionCountry`, `testimonial` (repeatable, Phase 3)
Genuinely repeatable documents — **not** locked in `sanity/structure.ts`;
the admin creates, reorders, and deletes these freely, unlike every other
type above. Each has a manual `order` field (`orderField()` in
`shared.ts`; seeded at 10/20/30/... so an insertion later doesn't require
renumbering everything after it).

| Type | Fields | Fetched by |
|---|---|---|
| `ministry` | `name`, `body`, `icon` (string, constrained to `lib/icon-map.ts`'s `ICON_NAMES`), `order` | `getMinistries()` |
| `missionCountry` | `name`, `order` | `getMissionCountries()` |
| `testimonial` | `quote`, `name`, `role`, `order` | `getTestimonials()` |

Unlike `getPage()`'s field-by-field merge, these three getters return
either the *entire* CMS list or the *entire* `lib/content.ts` sample list
— never a mix — since publishing even one real entry is taken as a signal
the admin has moved the whole list in, not that they're topping up a
partial default.

`ministry.icon` is a closed string enum; `lib/icon-map.ts`'s `iconFor()` is
the **only** place that string becomes an actual lucide component (never
a dynamic `lucide[name]` lookup from raw CMS input) — replacing the
previous positional `icons[i]` mapping in `components/ministries.tsx`,
which broke if items were ever reordered without also reordering the
hardcoded icon array.

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
POST /api/contact       Contact form → Resend email, honeypot + IP rate limit
```

Everything else is Server Component data fetching via
`lib/sanity/queries.ts` (`getBulletins(locale)`, `getSermons(locale)`) —
not a REST/GraphQL API consumed by the frontend.

---

## 9. External Integrations

| Service | Purpose | Notes |
|---|---|---|
| Sanity | CMS + file/asset storage | Project ID `ejhpsslc`, dataset `production` — public (briefly made private 2026-09-03, reverted; see §16); CDN file URLs are always public/unsigned regardless of dataset privacy setting |
| Vercel | Hosting, CI/CD, ISR | Auto-deploys `main` |
| Resend | Contact form email delivery | `app/api/contact/route.ts`; needs `RESEND_API_KEY` set in Vercel (not in local `.env.local`) or the route 503s |
| Google Maps | Directions deep links (no embedded preview) | Free `maps/dir` URL, no API key |
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
| `RESEND_API_KEY` | Auth for Resend email API — contact form 503s without it |
| `CONTACT_TO_EMAIL` | Where contact-form submissions are sent (defaults to `org.email`) |
| `CONTACT_FROM_EMAIL` | Resend "from" address (defaults to a Resend sandbox address) |
| `SANITY_API_TOKEN` | Not currently used — dataset is public again; would be needed only if it goes private (see §16) |

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
`DocumentViewer` renders `PdfView` for PDFs — which itself picks a native
`<iframe>` (desktop, ≥768px) or the canvas-based `PdfViewer` (mobile,
<768px) — or the Office Online iframe for `.docx`-only entries. Download
opens the raw file in a new tab (no forced silent save).

### "Get Directions" (`components/get-directions-button.tsx`)
No web API exists to detect installed apps, so this uses the accepted
industry workaround:
- **iOS:** try `comgooglemaps://` custom scheme; fall back to
  `maps.apple.com` only if the tab never went hidden (driven by
  `visibilitychange`, not a fixed timer — a timer alone false-triggers the
  fallback when Google Maps was already running, since foregrounding an
  already-open app can take a beat longer than launching it fresh).
- **Android:** `google.com/maps/dir` — Android's App Links hand off to the
  Google Maps app automatically when installed.
- **Desktop:** `window.open()` the Google Maps directions URL
  synchronously, immediately, in the click handler — no geolocation step.
  (An earlier version tried to pre-fill the origin via geolocation by
  opening a blank tab synchronously and redirecting it once the async
  geolocation call resolved; browsers inconsistently honor a navigation
  of an already-open window from that kind of async callback, which left
  a permanently blank tab for some users. Google Maps' own page already
  offers "use my location" once loaded — that's the right place for that
  prompt.)

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
- `/api/contact` validates server-side (name/email/message length), has an
  invisible honeypot field, and a per-IP in-memory rate limit (3/hour) —
  see the `// ponytail:` note in the route for its known limit (resets on
  cold start, not shared across instances).
- Security headers set globally (`next.config.ts`, skipping `/studio`):
  CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy`, `Permissions-Policy`, HSTS.
- Sanity dataset is public (briefly made private 2026-09-03, then
  reverted). Even when private, dataset-level privacy does not make
  bulletin/sermon **files** private — Sanity CDN file URLs are always
  public/unsigned. If the dataset is made private again, a read token
  must be added to `lib/sanity/client.ts`'s `createClient()` call first,
  or content fetches silently return empty (this happened 2026-09-03).
  See §16.
- **CMS-controlled hrefs are allowlisted, not trusted.** Every href field
  a Sanity editor can set — `siteSettings.phoneHref`/`emailHref`/`mapUrl`,
  `navItem.href`, `cta.href`, the `richText` link mark — goes through
  `hrefField()`'s validation (`^(https?://|mailto:|tel:|/|#)`), which
  blocks `javascript:` at the schema level in Studio. That check does
  **not** run against a document written directly via the API or Vision,
  so once rich text ships (a later phase) its render-side serializer must
  re-check the same pattern, not just trust the schema.
- **JSON-LD escaping** (`app/page.tsx`): `JSON.stringify()` does not escape
  `</script>`. Now that the JSON-LD payload includes CMS-sourced `org`
  fields (via `getSiteSettings()`), the output is passed through
  `.replace(/</g, "\\u003c")` before being placed in
  `dangerouslySetInnerHTML` — otherwise a value containing that sequence
  could break out of the script tag. Fixed 2026-09-15, Phase 1.

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

**PDF viewing: device-specific renderer, not one-size-fits-all**
Confirmed on the admin's real iPhone: a PDF loaded into a nested `<iframe>`
only shows page 1 on iOS Safari and never scrolls further — a WebKit
limitation, not a CSS-fixable bug. `react-pdf`/`pdf.js` renders each page
to its own `<canvas>` (plain DOM), which scrolls normally everywhere — so
that's used for mobile (`components/pdf-viewer.tsx`, lazy-loaded via the
`"use client"` boundary `pdf-viewer-lazy.tsx` since pdf.js touches
browser-only APIs at module load, and Next 16 rejects
`next/dynamic(..., { ssr: false })` called directly from a Server
Component).
On desktop, that same canvas renderer looked cramped — it was capped to a
fixed max width, tiny on a real monitor. Desktop browsers don't have the
iOS iframe bug, so a plain `<iframe src={pdf}#view=FitH>` there gets the
browser's own native PDF viewer for free — full toolbar, zoom, print,
thumbnails, auto-fit width. `components/pdf-view.tsx` picks between the
two client-side by viewport width (<768px = mobile).

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

**CMS content migration: stay on Sanity, `lib/content.ts` becomes typed
fallback defaults, not CMS migration.** Requirement (2026-09-15): the whole
site — not just bulletins/sermons — must be admin-editable from the CMS,
including images and a hero video. Sanity already covers this (singletons,
image pipeline, Portable Text, roles); no CMS switch needed. Rather than
deleting `lib/content.ts`, every getter merges a Sanity document *over* it
(`lib/sanity/defaults.ts`'s `withDefaults()`), so the site never blanks or
500s whether Sanity is unconfigured, a singleton doc doesn't exist yet, or
it exists with some fields still empty — the fallback IS the safety net,
not a temporary scaffold to delete later. Recommended subscription: apply
for Sanity's non-profit plan (mirrors the paid Growth tier's Editor role at
no cost) so the admin isn't a full Administrator with dataset-delete power.
Full plan: `siteSettings`/`navigation`/`homePage` singletons, one `page`
type keyed by slug for the six simple pages, `ministry`/`testimonial`/
`missionCountry` as their own documents, images via `@sanity/image-url`,
a Sanity-hosted hero background video only (no long-form video hosting —
out of scope), and draft preview. Phased, each phase independently
shippable — see §17/§18 for what has landed.

---

## 16. Known Limitations

- **Sanity dataset privacy vs. `lib/sanity/client.ts` having no read
  token.** Dataset was briefly made private 2026-09-03, which broke
  bulletins/sermons (archive pages rendered but returned empty) because
  `createClient()` has no `token`; reverted to public same day and
  content came back. Dataset is currently public — this is fine as long
  as it stays public, but going private again requires wiring a token
  first. Also note: even a private dataset doesn't hide the actual
  `.pdf`/`.docx` files — Sanity CDN file URLs are public/unsigned
  regardless of dataset privacy, so "private dataset" alone doesn't
  restrict file access. If file-level privacy is ever wanted, it needs
  signed/short-lived URLs, not just a private dataset + token.
- Contact form's in-memory rate limit resets on cold start and isn't
  shared across serverless instances — a soft per-instance guard, not a
  hard cap (`// ponytail:` note in `app/api/contact/route.ts`). No DB
  storage of submissions — Resend email only.
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
- **Bulletins/sermons homepage-teaser title vs. archive-page title stay
  separate CMS values.** `lib/content.ts`'s `bulletins`/`sermons` consts
  (used only by `components/bulletins.tsx`/`sermons.tsx`, the homepage
  teasers) are pre-existing, independent of `page.bulletins`/`page.sermons`
  (the archive page's own eyebrow/title/intro/tabsLabel/emptyText). This
  duplication predates the CMS migration — Phase 2 moved the archive
  page's copy into the CMS without unifying it with the teaser's, since
  they were already independently maintained. An admin editing the
  bulletins archive page's title in Studio won't change the homepage
  teaser's heading.
- **Nav dropdown children stay manual/literal.** `navItem`'s `childSource`
  field (e.g. `"ministries"`, `"missionCountries"`) exists on the schema
  as a later-phase hook for auto-generating a nav dropdown from real
  `ministry`/`missionCountry` documents, but the query layer never
  resolves it — the Ministries and Missions nav dropdowns are still the
  manual list seeded in Phase 1, unaffected by adding/removing/reordering
  `ministry`/`missionCountry` documents in Phase 3. An admin who adds a
  5th ministry must also add it to the nav item's manual children if they
  want it in the dropdown.

---

## 17. Current Development Status

**Completed:** Home, Bulletins/Sermons (Sanity-backed, weekly admin
workflow live, 33 bulletins migrated, paginated 12/page), Ministries/
Missions/History/Contact pages, Sunday Service section with directions,
light/dark theme, branded favicon, mobile/tablet responsive pass, PDF
viewer fix, contact form wired to real email (Resend) with rate limiting,
per-page SEO metadata + sitemap/robots, extra security headers, nav
dead-zone fix + visible hover/focus states, Playwright suite.

**Resolved:** Sanity dataset was briefly made private 2026-09-03 (broke
bulletins/sermons), reverted to public same day — content is back. See §16
for what's needed if it goes private again.

**In progress / next:** whole-site CMS migration — Phases 0 through 3 of 7
landed 2026-09-15 (infra; site chrome; page copy + SEO; ministries/mission
countries/testimonials promoted to their own repeatable documents with
real placeholder-badge toggles). All seeded and verified against the real
project. Next up is Phase 4 (images: `@sanity/image-url`,
`<SanityImage>`, hero/ministry images, a `gallery` document). Also:
connect `esfworld.us`, admin to fill in real Ministries/Missions copy and
start publishing Sermons.

**Planned (not started):** image gallery, hero background video (both via
the CMS migration's Phase 4/5), video embeds explicitly deferred/out of
scope per the approved plan.

---

## 18. Recent Changes

### 2026-09-15 — Playwright suite fixed to match real content
`tests/bulletins.spec.ts` and `tests/sermons.spec.ts` had asserted an
empty-state fallback on the documented assumption that no Sanity project
was configured in the test environment. That's no longer true: `.env.local`
points at the real project, English now has 32 real bulletins and 1 real
sermon (Spanish/French are still genuinely empty — schema-ready, zero
entries). Split each "every locale" test into an English case (asserts the
empty text is absent and at least one real entry renders — checked
structurally via a document row's `<h3>` heading, not a hardcoded
title/date, since content changes weekly) and an ES/FR case (asserts the
empty state, which is still accurate there). Same fix applied to the two
homepage-teaser tests in `tests/landing.spec.ts`, which pull from the same
`getBulletins`/`getSermons` calls. Also fixed a wording typo in
`tests/landing.spec.ts`'s copyright assertion — it expected "Evangelical
Student**s** Fellowship," but the real legal name used everywhere else in
the codebase (`lib/content.ts`, `README.md`, page titles, meta
descriptions) is "Evangelical Student Fellowship" with no "s"; the test
was wrong, not the content. All 31 Playwright tests now pass.

### 2026-09-15 — CMS migration Phase 3 (ministries, missions, testimonials become documents)
Ministries, mission countries, and student stories are now their own
repeatable Sanity documents (`ministry`, `missionCountry`, `testimonial`)
instead of inline arrays on a `page`/`homePage` document — an admin can
add, reorder, or remove one without touching anything else. The
"Placeholder content" badge on Ministries, Missions, and Student Stories
became a real `showPlaceholderBadge` toggle instead of a hardcoded `true`.

- New schemas: `ministry` (name, body, `icon`, `order`), `missionCountry`
  (name, `order`), `testimonial` (quote, name, role, `order`) — genuinely
  repeatable, **not** added to `SINGLETON_TYPES`, so the admin creates/
  deletes these freely (unlike every other type so far). `order` comes
  from a new `orderField()` factory in `shared.ts`, seeded at 10/20/30/...
- New `lib/icon-map.ts`: `ICON_NAMES` (a closed string enum the `ministry`
  schema imports) and `iconFor()` (the only place a `ministry.icon` string
  becomes a lucide component). Replaces the old positional
  `icons[i]`-indexed-by-array-position mapping in `components/ministries.tsx`,
  which would have silently shown the wrong icon for the wrong ministry if
  an admin ever reordered the list.
- Added `getMinistries()`, `getMissionCountries()`, `getTestimonials()` to
  `lib/sanity/queries.ts` — each returns either the entire real list or
  the entire `lib/content.ts` sample list, never a mix (unlike
  `getPage()`'s field-by-field merge), since one real entry existing is
  taken as a sign the admin moved the whole list in.
- `page.ministries`/`page.missions` lost their Phase 2 inline
  `items[]`/`countries[]` fields (now dead schema, since the seed script
  `unset`s them on documents that still carry the old data) in favor of
  `showPlaceholderBadge`; `homePage` gained a `testimonials` object
  (title, subtitle, `showPlaceholderBadge`).
- Split `components/testimonials.tsx` the same way `nav.tsx`/`hero.tsx`
  were split: an async server wrapper plus a new `testimonials-client.tsx`
  holding the carousel's interactive state/motion as pure props.
  `ministries.tsx`, `missions.tsx`, and both teasers now take a
  `placeholder` prop instead of hardcoding it.
- Updated `scripts/seed-content.ts` to seed the 4 sample ministries, 7
  mission countries, and 3 testimonials, and to backfill
  `showPlaceholderBadge`/`testimonials` onto the `page`/`homePage`
  documents that already existed from Phase 2 (via `setIfMissing`/`unset`
  patches, same idempotent pattern as Phase 2's `defaultSeo` backfill).
- Verified: typecheck/lint/build clean with the real project and with
  `NEXT_PUBLIC_SANITY_PROJECT_ID` unset. All 31 Playwright tests pass
  against both the fallback defaults and the real seeded documents (ran
  twice — a stale `next start` process left over from local testing was
  serving pre-Phase-3 code on port 3000 and caused two false-positive nav
  failures the first time; killing it and re-running confirmed the
  failures weren't a real regression). Manually verified in-browser:
  `/ministries` renders all 4 real `ministry` documents with correct
  per-item icons.

### 2026-09-15 — CMS migration Phase 2 (page copy + SEO)
Every page's own copy and search/sharing metadata is now editable from
Studio, via a new `page` document type (one per slug, covering
ministries/missions/history/contact/bulletins/sermons) and a new
`homePage` singleton (hero, mission statement, closing contact CTA).

- Each of the six inner routes gained a `generateMetadata()` reading
  `getPage(slug, fallback)` and passing its `seo` sub-object through the
  existing `pageMetadata()` helper (unchanged) — replacing a static
  `export const metadata`. `lib/content.ts` grew `pageSeoDefaults`, the
  literal title/description strings each page already had.
- Root layout (`app/layout.tsx`) converted the same way: `generateMetadata()`
  now reads `siteSettings.defaultSeo` (a new field, backfilled onto the
  existing Phase 1 `siteSettings` document via a `setIfMissing` patch in
  the seed script so it doesn't require deleting/recreating that doc).
- Split `components/hero.tsx` the same way `nav.tsx` was split in Phase 1:
  an async server wrapper (`getHomePage()`) plus a new `hero-client.tsx`
  holding all the motion/interactive code as pure props.
  `components/mission.tsx` and `contact-cta.tsx` became async server
  components reading `getHomePage()` directly — `contact-cta.tsx`'s
  previously-hardcoded heading/subtitle/button text now come from the CMS.
- `components/ministries.tsx`, `missions.tsx`, and `story.tsx` (the full
  page bodies) stopped importing `lib/content.ts` directly and became
  props-driven — their data now comes from each page's own `getPage()`
  call, not a module-level import.
- **Extended beyond the plan's explicit file list, to avoid a bug the
  phase would otherwise introduce:** `components/ministries-teaser.tsx`,
  `missions-teaser.tsx`, and `history-teaser.tsx` (the homepage's compact
  previews) also switched to `getPage()`. They weren't named in Phase 2's
  plan, but since the full pages they preview just became CMS-driven,
  leaving the teasers on the old `lib/content.ts` import would have made
  them silently go stale the moment an admin edited a page in Studio —
  the teaser and the full page would show different content for the same
  section. Fixing that was part of finishing this phase correctly, not
  scope creep.
- `app/page.tsx`'s JSON-LD now also sources `mission.statement` from
  `getHomePage()` instead of the static import (org already was, since
  Phase 1).
- Added the new documents to `scripts/seed-content.ts`
  (`homePage`, `page.ministries`, `page.missions`, `page.history`,
  `page.contact`, `page.bulletins`, `page.sermons`) and ran it against the
  real project.
- Verified: typecheck/lint/build clean with the real project and with
  `NEXT_PUBLIC_SANITY_PROJECT_ID` unset. All 31 Playwright tests pass
  against both the fallback defaults and, after seeding, the real Sanity
  documents. Manually verified in-browser: `/history` renders its CMS
  copy, and the homepage's `<title>`/meta description follow
  `siteSettings.defaultSeo`.

### 2026-09-15 — CMS migration Phase 1 (site chrome)
Org contact details, Sunday service time, footer blurb, and the nav CTA
label are now editable from Studio via the new `siteSettings` singleton;
the top nav's items via the new `navigation` singleton.

- Split `components/nav.tsx` into an async server wrapper (fetches
  `getSiteSettings()`/`getNavigation()`) and a new `components/nav-client.tsx`
  holding all the interactive behavior (scroll state, mobile menu,
  active-link highlighting) as a pure props-driven `"use client"`
  component — no behavior change, same `<Nav />` import everywhere.
- `components/footer.tsx` and `components/sunday-service.tsx` became async
  server components reading the same two getters.
- `app/page.tsx`'s JSON-LD now sources `org` from `getSiteSettings()` and
  gained the `<` escape described in §13.
- `app/api/contact/route.ts`'s fallback recipient email now also reads
  `getSiteSettings()` rather than the static `org` import, so it follows a
  CMS-updated email address.
- Added `scripts/seed-content.ts` (`npm run seed:content`) — seeds both
  singletons from `lib/content.ts`'s current values, idempotent via
  `createIfNotExists`. Ran against the real project; both documents exist.
- **Scope trim from the original plan:** `socials` stays out of
  `siteSettings` for this phase — `components/socials.tsx` is shared by
  both `footer.tsx` (in scope) and `contact.tsx` (Phase 2 scope, still a
  `"use client"` component reading `lib/content.ts` directly), and
  threading CMS data through both cleanly is a Phase 2-shaped change. Also
  trimmed: `navItem`'s `childSource` auto-generation (dropdowns built from
  future `ministry`/`missionCountry` documents) — the schema field exists,
  but Phase 1's query doesn't resolve it; all nav children are manual/
  literal for now, seeded to match today's site exactly. Root layout's
  `<title>`/description stay static (not `generateMetadata`) — folded into
  Phase 2's per-page SEO work instead of touching `app/layout.tsx` twice.
- Verified: typecheck/lint/build clean (real project **and**
  `NEXT_PUBLIC_SANITY_PROJECT_ID` unset). All 31 Playwright tests pass
  against both the fallback defaults and, after seeding, the real Sanity
  documents. Manually verified in-browser against the seeded project: nav,
  footer, and Sunday Service render the CMS values correctly.

### 2026-09-15 — CMS migration Phase 0 (infra, no visible change)
- Added `@sanity/image-url` as an explicit dependency (was only
  transitive); added `images.remotePatterns` for `cdn.sanity.io` to
  `next.config.ts` (`next/image` would otherwise fail on Sanity URLs).
- Added `media-src 'self' https://cdn.sanity.io` to the CSP — its absence
  would silently block any future Sanity-hosted video with no console
  error.
- Enabled Sanity TypeGen: `sanity-typegen.json` config, `npm run
  sanity:typegen` script (`sanity schemas extract` → `sanity typegen
  generate`), committed `sanity.types.ts`. Note: this installed CLI
  version (`@sanity/cli` 8.5.x) reads typegen config from
  `sanity-typegen.json` and prints a deprecation notice suggesting
  `sanity.cli.ts`'s `typegen` key instead — that key isn't in this
  version's `CliConfig` type yet, so the JSON config is what's actually
  wired; revisit when the CLI updates.
- Migrated `lib/sanity/queries.ts`'s two GROQ queries from a
  `/* groq */`-commented template literal to `defineQuery` (from
  `next-sanity`), and added a `sanityFetch()` wrapper that keeps the
  existing null-client guard and `{next:{tags,revalidate:60}}` idiom,
  takes its tag list explicitly (so a future combined query spanning
  several `_type`s can list all of them), and adds a `try/catch` — a
  Sanity outage now returns the fallback instead of throwing a 500. No
  behavioral change for bulletins/sermons; same tags, same params.
- Added `lib/sanity/defaults.ts`'s `withDefaults(fallback, doc)` — the
  merge helper every future CMS getter will use so the site never blanks
  when a document is missing or partially filled in.
- Added six reusable object schema types under
  `sanity/schemaTypes/objects/` (`cta`, `seo`, `imageWithAlt`,
  `socialLink`, `navItem`/`navChildLink`, `richText`), plus `HREF_RE` /
  `hrefField()` / `pageCopyFields()` / `contentGroups` factory helpers in
  `sanity/schemaTypes/shared.ts`. `richText`'s link annotation and every
  other href field route through the same allowlist
  (`^(https?://|mailto:|tel:|/|#)`) — the render-side serializer will
  need to re-check it once rich text ships in Phase 5, since schema
  validation doesn't run against documents written via the API/Vision.
- Added `sanity/structure.ts`: a custom Studio sidebar (currently
  Bulletins/Sermons, same as the stock default) and an exported empty
  `SINGLETON_TYPES` set that `sanity.config.ts`'s new
  `document.actions`/`newDocumentOptions` filters read — wired now, will
  start actually restricting once Phase 1 adds `siteSettings` etc.
- Verified: `npm run typecheck`, `npm run lint`, and `npm run build` all
  pass — both with `.env.local`'s real Sanity project configured and with
  `NEXT_PUBLIC_SANITY_PROJECT_ID` unset (the fallback path). Playwright:
  24/29 pass; the 5 failures are pre-existing and unrelated — see §16.

### 2026-09-03
- Sanity dataset briefly switched to private — broke bulletins/sermons
  fetching since no read token exists in `lib/sanity/client.ts` or env
  (confirmed via local dev preview: pages loaded, content list empty).
  Reverted back to public same day; content confirmed working again. No
  code change made or needed.
- Confirmed Sanity CDN file URLs are public/unsigned regardless of
  dataset privacy, and no `media-src` CSP directive is set — drafted a
  plan for private contact-form storage + signed private media if
  file-level privacy is wanted later; not implemented, still just an idea.

### 2026-09-02 (evening)
- Fixed nav bar "dead zone" (breakpoint gap that hid the "Get in touch"
  button) by aligning all nav breakpoints to `lg`; added visible
  hover/focus background + ring styling to desktop nav items and the CTA
  button.

### 2026-09-02
- Fixed nav/ministries label inconsistency: standardized "Adult" to
  "Young Adults" across content, metadata, and tests.
- Wired `lib/seo.ts`'s `pageMetadata()` into all six static pages for
  per-page canonical/OG tags; added `app/sitemap.ts` and `app/robots.ts`
  (gated by `NEXT_PUBLIC_ALLOW_INDEXING`); added a default OG image
  generator via Next's `ImageResponse`.
- Extended `next.config.ts` `headers()` with `Permissions-Policy` and
  HSTS.
- Wired the contact form to real email delivery via Resend
  (`app/api/contact/route.ts`), with server-side validation, a honeypot
  field, and a per-IP rate limit.
- Paginated `/bulletins` and `/sermons` archives, 12 per page.

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
- Fixed the PDF viewer looking tiny on desktop (was capped to the same
  fixed-width canvas renderer used for the iOS fix) — desktop now gets a
  native `<iframe>` PDF viewer instead (`components/pdf-view.tsx`).
- Fixed Get Directions opening a blank tab on desktop, and falsely
  falling back to Apple Maps on iOS when Google Maps was already running;
  removed the embedded Google Maps preview from Sunday Service and
  centered its content.

**Files/areas most affected:** `components/document-*.tsx`,
`components/pdf-view*.tsx`, `components/sunday-service.tsx`,
`components/get-directions-button.tsx`, `sanity/schemaTypes/*`,
`app/{ministries,missions,history,contact}/page.tsx`, `lib/content.ts`,
`components/nav.tsx`.
