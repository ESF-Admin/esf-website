# Project Context

Technical reference for the ESF website: how it's built, how the pieces fit,
and why key decisions were made. For setup and everyday commands, see
[README.md](README.md). Keep this file current: when a change affects the
stack, routes, data model, environment variables, deployment or a documented
decision, update the matching section and add one line to the
[Changelog](#13-changelog).

## Contents

1. [Overview](#1-overview)
2. [Stack](#2-stack)
3. [Architecture](#3-architecture)
4. [Code layout](#4-code-layout)
5. [Data model (Sanity)](#5-data-model-sanity)
6. [API routes](#6-api-routes)
7. [Environment variables](#7-environment-variables)
8. [Key workflows](#8-key-workflows)
9. [Conventions](#9-conventions)
10. [Security](#10-security)
11. [Technical decisions](#11-technical-decisions)
12. [Known limitations and next steps](#12-known-limitations-and-next-steps)
13. [Changelog](#13-changelog)

---

## 1. Overview

Public ministry website for Evangelical Student Fellowship (ESF), founded in
Seoul in 1976 and now also a multi-ethnic ministry in Chicago.

**Users**
- **Visitors**: read about ESF, find the Sunday service, read or download
  bulletins and sermons (English, Spanish, French), send a contact message.
- **Church admin**: edits all site content and publishes weekly documents in
  Sanity Studio (`/studio`), and reads contact messages at `/internal`.

**Features**
- Bulletins and sermons archives, paginated 12 per page, filtered by language
- In-browser PDF viewer (with a Word `.docx` fallback) and download
- Sunday service section with a platform-aware "Get Directions" button
- Home, Ministries, Missions, History and Contact pages, all CMS-editable
- Optional background video on the home page hero
- Light/dark theme (light by default, does not follow the OS setting)
- Contact form: email via Resend, reCAPTCHA v3, honeypot, rate limit, stored
  privately in Sanity
- SEO: per-page titles/descriptions/canonicals, Open Graph image on every page,
  WebSite + Organization/Church JSON-LD, sitemap, robots; Vercel Web Analytics

---

## 2. Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16.3.5 (App Router, Turbopack), React 19.2.8, TypeScript |
| Styling | Tailwind CSS v4; theme tokens are CSS variables in `app/globals.css` |
| Motion / icons / theme | `motion`, `lucide-react`, `next-themes` |
| PDF | `react-pdf` (pdf.js), client-only |
| CMS and file storage | Sanity (`sanity`, `next-sanity`, `@sanity/image-url`, `@portabletext/react`, `@sanity/vision`) |
| Email | Resend |
| Bot protection | Google reCAPTCHA v3 |
| Hosting | Vercel (Hobby), auto-deploys `main`; `@vercel/analytics` |
| Tests | Playwright (`tests/*.spec.ts`) |

Repo: GitHub `ESF-Admin/esf-website`. No separate CI; Vercel builds on push.

---

## 3. Architecture

```text
Visitor
  │
  ▼
Next.js on Vercel ── Server Components render pages
  │                   (static + ISR every 60 s, instant purge via webhook)
  │
  ├── lib/sanity/queries.ts ──► Sanity dataset "production" (public read, CDN)
  │
  ├── POST /api/revalidate ◄── Sanity webhook on publish
  │
  └── POST /api/contact ──► reCAPTCHA check
                          ├─► Resend (notification + auto-reply)
                          └─► Sanity dataset "internal" (private, token write)

Sanity Studio (embedded in this app, Sanity login required)
  /studio    → "production" dataset: all site content
  /internal  → "internal" dataset: contact submissions only
```

There is no separate backend or database. Pages read Sanity directly on the
server. Uploaded files (`.docx`, `.pdf`, images, video) live on Sanity's CDN
(`cdn.sanity.io`).

**Fallback defaults.** Every content getter merges the Sanity document over
typed defaults in `lib/content.ts` (`withDefaults()` in
`lib/sanity/defaults.ts`). If Sanity is unconfigured, down, or a document is
missing or half-filled, the site still renders. The defaults are a permanent
safety net, not scaffolding to delete.

**External services**

| Service | Purpose | Notes |
| --- | --- | --- |
| Sanity | CMS, asset CDN | Project `ejhpsslc`. Datasets: `production` (public) and `internal` (private). A `production-comments` add-on dataset is created by Studio comments and does not count toward the plan quota. |
| Vercel | Hosting, ISR, analytics | Preview deploys read the same production dataset. |
| Resend | Contact email | Route returns 503 without `RESEND_API_KEY`. |
| Google reCAPTCHA v3 | Contact spam filter | Skipped when keys are unset. Score threshold 0.5. |
| Google Maps | Directions links | Plain `maps/dir` URLs, no API key. |
| Microsoft Office Online Viewer | `.docx` preview | Used only when a document has no PDF. |

---

## 4. Code layout

```text
app/
├── layout.tsx                  Root layout: fonts, ThemeProvider, Analytics; metadata from siteSettings.defaultSeo
├── page.tsx                    Home: hero, service, teasers, mission, stories, contact CTA, JSON-LD
├── bulletins/, sermons/        Archive (?lang=en|es|fr&page=N) + view/ (single-document viewer)
├── ministries/, missions/, history/, contact/   Content pages, each with generateMetadata()
├── studio/[[...tool]]/         Sanity Studio, site content workspace
├── internal/[[...tool]]/       Sanity Studio, contact submissions workspace
├── api/revalidate/route.ts     Sanity webhook → revalidateTag
├── api/contact/route.ts        Contact form handler
├── opengraph-image.tsx, icon.svg, robots.ts, sitemap.ts
└── globals.css                 Theme tokens

components/
├── nav.tsx + nav-client.tsx            Server wrapper fetches data; client handles scroll, menu, active link
├── hero.tsx + hero-client.tsx          Same split; client renders motion and optional background video
├── testimonials.tsx + testimonials-client.tsx   Same split; renders nothing when there are no stories
├── footer.tsx, mission.tsx, contact-cta.tsx, sunday-service.tsx   Async server components
├── {ministries,missions,history}-teaser.tsx     Home page previews, same data source as the full pages
├── ministries.tsx, missions.tsx, story.tsx      Full page bodies (props only)
├── bulletins.tsx, sermons.tsx          Home page teasers for the weekly documents
├── document-row / -teaser / -archive / -viewer.tsx   Shared bulletin + sermon UI
├── pdf-view.tsx                        Chooses native <iframe> (≥768px) or canvas viewer (<768px)
├── pdf-viewer.tsx, pdf-viewer-lazy.tsx Canvas renderer (pdf.js), lazy-loaded client boundary
├── get-directions-button.tsx           Platform-aware maps link (see §8)
├── contact.tsx                         Contact form (reCAPTCHA, honeypot)
├── rich-text.tsx                       The only Portable Text renderer; re-checks link hrefs
├── sanity-image.tsx                    next/image wrapper for imageWithAlt fields (ready, not yet used)
├── section.tsx, reveal.tsx, arch-art.tsx, theme-provider.tsx, theme-toggle.tsx

lib/
├── content.ts                  Default text for every CMS field + nav + per-page SEO defaults
├── href.ts                     isSafeHref() / safeHref(): render-time link allowlist
├── icon-map.ts                 ICON_NAMES allowlist + iconFor() (ministry icon string → lucide icon)
├── seo.ts                      siteUrl, allowIndexing, siteKeywords, openGraphBase, pageMetadata()
├── email/contact-templates.ts  Notification and auto-reply email bodies
└── sanity/
    ├── client.ts               Public read client (memoized, null when unconfigured)
    ├── internal-client.ts      Server-only write client for the "internal" dataset
    ├── queries.ts              GROQ (defineQuery) + sanityFetch() + all get*() functions
    ├── defaults.ts             withDefaults(fallback, doc)
    ├── image.ts                urlFor() + SanityImageData type
    └── portable-text.ts        plainTextToBlocks() / blocksToPlainText()

sanity/
├── env.ts                      Reads NEXT_PUBLIC_SANITY_*; never throws
├── structure.ts                Studio sidebar; SINGLETON_TYPES lock list; per-language bulletin/sermon lists
└── schemaTypes/                Document types, shared.ts field factories, objects/ (cta, seo, imageWithAlt, navItem, richText)

sanity.config.ts                Two workspaces: "default" (/studio) and "internal" (/internal)
sanity.types.ts                 Generated by `npm run sanity:typegen`, committed
scripts/                        seed-content.ts, seed-bulletins.ts, upload-hero-video.ts; one-time migrate-*.ts
tests/                          landing, bulletins, sermons, contact specs
```

Bulletins and sermons share their UI (`document-*.tsx`) and schema fields
(`sanity/schemaTypes/shared.ts`). A third weekly document type should extend
that shared layer, not copy the bulletin files.

---

## 5. Data model (Sanity)

### Weekly documents: `bulletin`, `sermon`

| Field | Type | Notes |
| --- | --- | --- |
| `date` | date | Required; sort key, newest first |
| `locale` | `en` \| `es` \| `fr` | Required |
| `file` | file (`.doc`/`.docx`) | Optional until ready; View is disabled without it |
| `pdf` | file | Optional; makes View faster (PDF viewer instead of Office iframe) |
| `title`, `scripture`, `speaker` | string | **Sermons only.** Bulletins are identified by date alone. |

A bulletin is the order of service; a sermon is the manuscript. They are
different documents for the same Sunday, not duplicates. English has real
content; Spanish and French have none yet and show an empty state.

### Singletons (fixed `_id`, can't be created, duplicated or deleted in Studio)

| Type | Holds |
| --- | --- |
| `siteSettings` | Org name/short name/footer name, phone, email, address, map link, copyright year, service day/time/note, footer blurb, nav button label, `defaultSeo` |
| `navigation` | `items[]` of `navItem` (label, href, manual `children[]`) |
| `homePage` | `hero` (eyebrow, title, body, two CTAs, optional `video` ≤25 MB mp4/webm + required `poster` when video is set), `mission` (title, rich-text statement), `contactCta`, `testimonials` (section title/subtitle) |
| `page` (six docs, `_id: page-<slug>`) | Shared: eyebrow, title, intro, `seo`. Extra: `history` → paragraphs, milestones; `bulletins`/`sermons` → tabsLabel, emptyText |

`getNavigation()` falls back to `lib/content.ts`'s `navLinks` as a whole list
when `items` is empty. `getPage(slug, fallback)` merges field by field.

### Repeatable documents (admin creates, orders, deletes freely)

| Type | Fields | Getter | When none exist |
| --- | --- | --- | --- |
| `ministry` | name, body, `icon` (from `ICON_NAMES`), order | `getMinistries()` | Default list from `lib/content.ts` |
| `missionCountry` | name, order | `getMissionCountries()` | Default list from `lib/content.ts` |
| `testimonial` | quote, name, role, order | `getTestimonials()` | Empty; the Student Stories section is hidden |

Lists are either entirely from Sanity or entirely default, never mixed.
`order` values are spaced 10, 20, 30 so new entries can be inserted.

### Private: `contactSubmission` (dataset `internal` only)

name, email, phone, message, submittedAt, ip. Deliberately **not** in
`sanity/schemaTypes/index.ts`, so it can never be created in the public
dataset. Written by `/api/contact`, viewed at `/internal`.

After any schema change, run `npm run sanity:typegen` and commit
`sanity.types.ts`.

---

## 6. API routes

| Route | Does |
| --- | --- |
| `POST /api/revalidate` | Verifies `SANITY_REVALIDATE_SECRET`, then `revalidateTag(body._type)` so published changes appear immediately. Errors return a generic message; details are logged server-side only. |
| `POST /api/contact` | Per-IP rate limit (3/hour) → body size limit (20 KB) → honeypot → field validation → reCAPTCHA → store in `internal` dataset (non-blocking) → Resend notification (reply-to visitor) and auto-reply. |

All other data is fetched in Server Components through `lib/sanity/queries.ts`.

---

## 7. Environment variables

Full list with comments: `.env.local.example`. `.env*` files are gitignored
except the example.

| Variable | Purpose | If unset |
| --- | --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project | Site renders defaults; Studio shows a config error |
| `NEXT_PUBLIC_SANITY_DATASET` | Public dataset | `production` |
| `NEXT_PUBLIC_SANITY_API_VERSION` | API version pin | `2025-01-01` |
| `SANITY_REVALIDATE_SECRET` | Webhook auth | Updates wait for the 60 s ISR window |
| `SANITY_INTERNAL_TOKEN` | Write token for `internal` dataset | Messages are emailed but not stored |
| `RESEND_API_KEY` | Email delivery | Contact form returns 503 |
| `CONTACT_TO_EMAIL` | Recipient | `siteSettings` email |
| `CONTACT_FROM_EMAIL` | Sender | Resend test sender |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY` | Spam protection | Check skipped |
| `NEXT_PUBLIC_SITE_URL` | Canonical/OG/sitemap base URL (trailing slash is stripped) | `https://www.esfworld.us` |
| `NEXT_PUBLIC_ALLOW_INDEXING` | `true` allows search indexing | `noindex` (current state) |

---

## 8. Key workflows

**Publishing.** Admin publishes in Studio → Sanity webhook calls
`/api/revalidate` → the matching cache tag is purged → live within seconds.
Webhook setup: Sanity dashboard → API → Webhooks → URL
`<site>/api/revalidate`, same secret as `SANITY_REVALIDATE_SECRET`.

**Viewing a document.** `DocumentRow` links to
`/{bulletins|sermons}/view?src=…&type=pdf|docx`. PDFs use the browser's own
viewer in an `<iframe>` on desktop and the pdf.js canvas viewer on mobile.
`.docx`-only entries use the Office Online iframe. Download opens the file in
a new tab.

**Get Directions** (`components/get-directions-button.tsx`). Browsers can't
detect installed apps, so:
- iOS: try `comgooglemaps://`; if the page never becomes hidden
  (`visibilitychange`), fall back to Apple Maps.
- Android: `google.com/maps/dir` (App Links open the Maps app if installed).
- Desktop: open the Google Maps directions URL synchronously in the click
  handler. No geolocation step, which previously caused blank tabs.

**New Sanity project from scratch.** Set env vars → `npm run seed:content`
(all singletons, pages and default lists; idempotent) → optionally
`npm run seed:bulletins` (33 historical English bulletins, no files) →
create the `internal` dataset (`npx sanity dataset create internal
--visibility private`) and a write token → add the webhook.

**Hero video.** `npm run upload:hero-video -- --video=… --poster=… [--alt=…]`
uploads both and sets them on `homePage.hero`. Compress first (720p,
H.264, muted); the Studio limit is 25 MB.

---

## 9. Conventions

- Anything a non-developer might change is a CMS field with a default in
  `lib/content.ts`, not a string hardcoded in a component.
- Components that need data and interactivity are split into an async server
  wrapper (fetches) and a `*-client.tsx` (pure props, `"use client"`).
- Browser-only APIs (pdf.js, geolocation, URL schemes) live in their own
  client files.
- `Section` is the standard section wrapper; use `headingLevel="h1"` only on
  a dedicated page, never in a home page teaser.
- Add an abstraction when a second real use appears, not before.
- Before finishing a change: `npm run typecheck`, `npm run lint`, `npm test`.

---

## 10. Security

- **Link allowlist, checked twice.** Every CMS href (CTAs, nav, contact
  links, rich-text links) must match `^(https?://|mailto:|tel:|/|#)`. Studio
  validates it (`hrefField()`), and the render layer re-checks it
  (`lib/href.ts`, `rich-text.tsx`), because documents written via the API or
  Vision skip Studio validation. Unsafe values render as `#`. Verified by
  injecting a `javascript:` link through the API.
- **No CMS HTML.** Nothing from Sanity reaches `dangerouslySetInnerHTML`
  except the home page JSON-LD, which is `JSON.stringify`'d with `<`
  escaped. Portable Text renders only through `<RichText>`.
- **Viewer URLs.** `document-viewer.tsx` only renders file URLs on
  `*.sanity.io` (`isTrustedFileUrl`), so the view route can't frame
  arbitrary sites.
- **Contact PII** is stored only in the private `internal` dataset, written
  by a server-only token client.
- **Headers** (`next.config.ts`, all routes except `/studio` and
  `/internal`): CSP, HSTS, `X-Frame-Options: DENY`, `nosniff`,
  `Referrer-Policy`, `Permissions-Policy`. `X-Powered-By` is disabled.
  `'unsafe-inline'` remains in `script-src` (App Router hydration scripts,
  JSON-LD; nonces would force dynamic rendering and lose ISR) and
  `style-src` (Motion writes inline styles). `'unsafe-eval'` is dev only.
- **Uploads.** File type is checked by MIME and extension; hero video is
  capped at 25 MB and always `muted`.
- **Secrets** live only in env vars. API errors never return internal
  details.
- **Studio access** is Sanity's own login, limited to invited members.
- **Dependencies.** Next.js is kept on patched releases (16.3.5 for the
  August 2026 advisories). Remaining `npm audit` findings are in Sanity's
  build-time tooling, not the request path; the only automatic fix would
  downgrade `sanity` to v5, so they are accepted.

---

## 11. Technical decisions

**Sanity for all content, with code defaults.** The whole site is
admin-editable. Sanity covers singletons, images, rich text and roles, so no
CMS switch was needed. `lib/content.ts` stays as typed fallback data.
Consider Sanity's non-profit plan so the admin can have the Editor role
instead of full Administrator.

**Two datasets.** `production` is public-read (no token in the site's
client), so contact submissions, which contain personal data, go to a
separate private `internal` dataset with its own Studio workspace. If
`production` is ever made private, add a read token to
`lib/sanity/client.ts` first, or every fetch silently returns empty (this
happened on 2026-09-03). Note that Sanity file URLs are public regardless of
dataset privacy.

**Device-specific PDF viewing.** iOS Safari shows only page 1 of a PDF in an
iframe and won't scroll. Mobile therefore uses pdf.js canvases; desktop uses
the browser's native viewer, which is better at large sizes.
`pdf-viewer-lazy.tsx` exists because Next 16 disallows
`next/dynamic({ ssr: false })` directly in a Server Component.

**Externalize only `swr`.** Sanity imports `swr`, which breaks the RSC
bundler. Externalizing all of `sanity` fixed the build but crashed Studio at
runtime (two React instances), so only `swr` is externalized.

**ISR 60 s plus webhook.** The webhook makes updates instant; the 60 s window
is a safety net if a webhook is missed.

**Files on Sanity's CDN, video kept small.** No separate file store. The hero
background video is the only hosted video; long-form video should be a
YouTube/Vimeo embed.

**Vercel hosting.** ISR, tag revalidation and Server Components work there
with no extra setup.

**Singleton locking.** `SINGLETON_TYPES` in `sanity/structure.ts` removes
create/duplicate/delete/unpublish for `siteSettings`, `navigation`,
`homePage` and the six `page` docs. Repeatable types are not locked.

---

## 12. Known limitations and next steps

**Limitations**
- The in-app contact rate limit is in memory, per server instance, and
  resets on cold start. The Vercel Firewall rate-limit rule (dashboard, not
  in code) is the real cap; reCAPTCHA is the main bot gate.
- Below-the-fold sections animate in with JavaScript and stay hidden without
  it.
- The home page bulletins/sermons teaser headings (`lib/content.ts`) are
  separate from the archive page titles (`page.bulletins` / `page.sermons`).
  Editing one doesn't change the other.
- Nav dropdown children are maintained by hand. `navItem.childSource` exists
  in the schema but isn't resolved, so a new ministry must also be added to
  the nav manually.
- **Document IDs must not contain a dot.** Sanity treats dotted IDs as
  private, so the public client can't read them. Seeded IDs use a hyphen
  (`page-history`, `ministry-evangelism`); IDs Studio creates are dot-free
  already. The old dotted copies from before 2026-09-23 (six `page.*`, four
  `ministry.*`, seven `missionCountry.*`, and three sample `testimonial.*`)
  are unused and can be deleted with `npx sanity documents delete <ids>`.

**Next steps**
- Go live in search: in Vercel set `NEXT_PUBLIC_SITE_URL=https://www.esfworld.us`
  (currently the vercel.app address, so canonicals point there) and
  `NEXT_PUBLIC_ALLOW_INDEXING=true`, redeploy, redirect the `*.vercel.app`
  domain to `www.esfworld.us`, add `www.esfworld.us` to Sanity CORS origins,
  then verify the domain in Google Search Console and Bing Webmaster Tools and
  submit `/sitemap.xml`.
- Home page title and description live in Studio (Site settings → Search &
  sharing); update them to match the new default in `lib/sanity/queries.ts`.
- Admin: add real Ministries, Missions and Student Stories content; publish
  sermons; start Spanish/French documents.
- Optional: image gallery and per-ministry images (the image pipeline and
  `<SanityImage>` are ready), auto-generated nav dropdowns.

---

## 13. Changelog

Newest first, one line per change. Full detail is in git history.

- **2026-09-24**: Hosting on Vercel Pro, CMS on Sanity Growth. Vercel Firewall (WAF) custom rules added in the dashboard: rate limits on `POST /api/contact` and `/api/revalidate`, deny common exploit probes. Contact form shows a friendly "try again later" notice on any 429 (app or firewall) and keeps the typed message.

- **2026-09-23**: Seeded `page`, `ministry` and `missionCountry` documents moved from dotted IDs (private in Sanity, never read by the site) to hyphenated IDs (`scripts/migrate-page-ids.ts`); Studio edits to pages, ministries and mission countries now reach the site. Sample testimonials not migrated.
- **2026-09-23**: SEO pass: shared `siteUrl` (fixes `//` in sitemap/robots), Open Graph image and site name kept on inner pages, title template `%s | ESF – Evangelical Student Fellowship`, WebSite + Organization/Church JSON-LD, expanded keywords, richer page descriptions, robots blocks `/studio`, `/internal`, `/api/`, viewer pages `noindex, follow`.
- **2026-09-23**: Docs rewritten (README for non-technical readers, this file condensed). `sanity:schema` now passes `--workspace default` (typegen failed after the second workspace was added); `sanity.types.ts` regenerated.
- **2026-09-18**: Removed the "Placeholder content" badge and `showPlaceholderBadge` toggles; Student Stories hidden until real testimonials exist; removed unused social links (component, schema, content). Testimonial carousel test skips when there are no stories.
- **2026-09-17**: Bulletins lose title/scripture (shown by date only); Studio lists bulletins and sermons per language. Vercel Web Analytics added. Hero video cap raised to 25 MB. Logo click on `/` reloads to the top. Contact form completed: reCAPTCHA v3, storage in the private `internal` dataset with its own `/internal` Studio workspace, branded HTML emails with auto-reply.
- **2026-09-16**: Security review: render-time href allowlist on every CMS link (`lib/href.ts`), generic errors in `/api/revalidate`, `X-Powered-By` off, Next.js 16.3.1 → 16.3.5.
- **2026-09-15/16**: Whole-site CMS migration (phases 0 to 5): `siteSettings`, `navigation`, `homePage`, `page`, `ministry`, `missionCountry`, `testimonial`; image pipeline; CMS hero video; rich-text mission statement; TypeGen; `withDefaults()` fallbacks. Tests updated to real content.
- **2026-09-03**: `production` dataset briefly made private, which emptied bulletins/sermons; reverted the same day.
- **2026-09-02**: PDF-only View fix and real file-type validation; address in footer. Per-page SEO, sitemap, robots, OG image; Permissions-Policy and HSTS; contact form wired to Resend; archives paginated 12 per page; nav breakpoint fix.
- **2026-08-31 to 09-01**: Initial site. Optional PDF field; Studio crash fixed by externalizing only `swr`. Sermons added alongside bulletins with shared `document-*` components; iOS PDF fix (pdf.js canvas) and native desktop PDF viewer; Sunday service section with Get Directions; every nav item became a real route; ISR revalidation fix; light theme by default; branded favicon.
