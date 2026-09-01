# Evangelical Student Fellowship — landing page

Single-page marketing site for ESF, an international Christian student ministry
founded in Seoul, Korea in 1976 and now also serving a multi-ethnic ministry in
Chicago.

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Motion (Framer Motion) ·
Sanity (bulletins CMS) · Playwright.

## Commands

```bash
npm run dev            # local dev server on :3000
npm run build           # production build
npm run typecheck       # tsc --noEmit
npm run lint             # eslint
npm test                 # Playwright suite (builds + starts the app itself)
npm run seed:bulletins   # one-time: push the original 33 bulletins into Sanity
```

## Content

Most static copy lives in `lib/content.ts`.

Real, verified ESF facts (`org`, `hero`, `story`, `mission`, contact details)
are taken from the live site. The `sermons` and `testimonials` groups are
**placeholder filler** — they carry `placeholder: true`, which renders a
visible "Placeholder content" badge above the section. Replace the items and
drop the flag before launch.

**Bulletins are not in `content.ts`** — they're the one content type that
changes weekly, so they live in Sanity instead of code. See "Bulletins CMS"
below.

No imagery from the previous Wix site is used. The hero artwork is an inline
SVG (`components/arch-art.tsx`) that inherits the theme tokens, so the page
ships with no third-party image assets.

## Bulletins CMS (Sanity)

Every Sunday bulletin — date, title, scripture reference, and the `.docx`
file itself — is a `bulletin` document in Sanity (schema at
`sanity/schemaTypes/bulletin.ts`). This is what lets the church admin publish
a new one every week without a developer or a deploy.

**Weekly workflow (non-technical):**
1. Go to `/studio` on the live site and log in.
2. Click **Bulletin → Create new**.
3. Fill in the service date, message title, scripture reference, and upload
   the `.docx` file.
4. Click **Publish**.
5. Within a few seconds the entry appears at the top of `/bulletins` (sorted
   by date, newest first) and in the homepage teaser — no redeploy needed.

**One-time setup (developer):**
1. Create a free project at [sanity.io/manage](https://sanity.io/manage) (or
   run `npx sanity init` from this folder).
2. Copy `.env.local.example` to `.env.local` and fill in
   `NEXT_PUBLIC_SANITY_PROJECT_ID` / `NEXT_PUBLIC_SANITY_DATASET`.
3. Run `npm run seed:bulletins` once to migrate the original 33 bulletins
   (hand-sourced from esfworld.us/bulletin) into Sanity — they're created
   without a file attached; upload each `.docx` from `/studio` afterward, or
   leave older ones as-is (they render with a disabled "View" button, same as
   before this migration).
4. In the Sanity project dashboard: **API → Webhooks** → add one pointed at
   `<your-deployed-url>/api/revalidate`, filtered to `_type == "bulletin"`,
   with a secret — put that same secret in `SANITY_REVALIDATE_SECRET`. This
   is what makes publishing show up on the site instantly instead of waiting
   for the next natural cache expiry.

**Viewing/downloading:** browsers can't render `.docx` natively, so "View"
opens `/bulletins/view` which embeds the file via Microsoft's Office Online
Viewer (`view.officeapps.live.com`), fed the file's public Sanity CDN URL —
no conversion step. "Download" links straight to that same CDN URL. Until a
document is uploaded, its "View" button is disabled.

Until Sanity is configured, the site still builds and runs — `/bulletins` and
the homepage teaser just render their "nothing published yet" empty state,
and `/studio` shows Sanity's own "needs a projectId" error page.

## Environment

| Variable | Effect |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical/OG base URL. Defaults to `https://esf.example.org`. |
| `NEXT_PUBLIC_ALLOW_INDEXING` | `true` emits `index, follow`. Anything else (the default) keeps `noindex, nofollow`, matching the current live site. |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` / `NEXT_PUBLIC_SANITY_DATASET` | Sanity project connection — see "Bulletins CMS" above. |
| `SANITY_REVALIDATE_SECRET` | Shared secret for the Sanity → `/api/revalidate` webhook. |

## Theming

Colour tokens are CSS custom properties in `app/globals.css`, with a `.dark`
override applied by `next-themes`. `--band` / `--on-band` are deliberately
separate from `--primary` so the full-bleed mission section stays deep navy in
both themes.

## Known gaps

- The contact form validates client-side and shows a success state, but does
  not POST anywhere yet. Wire it to `/api/contact` (or a form service) in
  `components/contact.tsx`.
- Scroll-triggered sections start at `opacity: 0` and are revealed by JS, so
  the page below the fold is blank with JavaScript disabled.
