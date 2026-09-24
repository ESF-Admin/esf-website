# ESF Website

The website for **Evangelical Student Fellowship (ESF)**, a Christian student
ministry founded in Seoul, Korea in 1976 that now also serves a multi-ethnic
ministry in Chicago.

Visitors can read about ESF, find the Sunday service, read or download weekly
bulletins and sermons, and send a message through the contact form. Church
staff update all of this themselves in an online editor, with no code needed.

---

## For church staff: updating the website

Everything on the site is edited at **`<site address>/studio`**. Sign in with
the account you were invited with.

**Publish this week's bulletin or sermon**

1. Open **Bulletins** (or **Sermons**), pick the language, then click **Create new** (the pencil icon).
2. Set the service date (and for sermons: title, scripture and speaker).
3. Upload the Word file (`.docx`). Also upload a **PDF** copy if you have one,
   because it opens much faster for visitors.
4. Click **Publish**. The site updates within a few seconds.

**Change other content:** use **Site settings** (phone, email, address, service
time), **Navigation menu**, **Home page**, **Pages**, **Ministries**,
**Mission countries** and **Student stories**. Student Stories stays hidden on
the home page until at least one story is published.

**Read contact form messages:** go to **`<site address>/internal`**. Every
message is also emailed to the church inbox.

---

## For developers

### What it's built with

| Part | Tool |
| --- | --- |
| Website | [Next.js 16](https://nextjs.org) (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4, Motion (animations), next-themes (light/dark) |
| Content editor and file storage | [Sanity](https://www.sanity.io), embedded at `/studio` and `/internal` |
| Contact form email | [Resend](https://resend.com), with Google reCAPTCHA v3 for spam protection |
| Hosting and analytics | [Vercel](https://vercel.com). Every push to `main` deploys automatically. |
| Tests | Playwright |

### Run it locally

You need Node.js 20 or newer.

```bash
npm install
```

```bash
cp .env.local.example .env.local
```

Fill in `.env.local` (see [Environment variables](#environment-variables)). At
minimum you need `NEXT_PUBLIC_SANITY_PROJECT_ID` to see real content. Without
it the site still runs, using the built-in default text from `lib/content.ts`.

```bash
npm run dev
```

Then open http://localhost:3000.

### Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the local dev server on port 3000 |
| `npm run build` / `npm start` | Build and run the production version |
| `npm run typecheck` | Check TypeScript types |
| `npm run lint` | Check code style |
| `npm test` | Run the Playwright tests. Stop `npm run dev` first, because the tests start their own server. |
| `npm run sanity:typegen` | Regenerate `sanity.types.ts` after changing a Sanity schema |
| `npm run seed:content` | Fill a new, empty Sanity project with the default content (safe to re-run) |
| `npm run upload:hero-video -- --video=clip.mp4 --poster=frame.jpg` | Upload or replace the home page background video |

### Project layout

```text
app/          Pages and API routes. Each folder is a URL, e.g. app/sermons → /sermons
components/   The building blocks of each page (nav, hero, footer, PDF viewer…)
lib/          Data fetching from Sanity, default text (content.ts), helpers
sanity/       Content editor setup: what fields each content type has
scripts/      One-off Sanity scripts (seeding content, uploading the hero video)
tests/        Playwright tests
public/       Static files
```

A fuller technical reference (architecture, data model, security, decisions)
is in [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md).

### Environment variables

Set these in `.env.local` for local work, and in the Vercel project settings for
the live site. `.env.local.example` explains each one. Every service is
optional locally, and the site keeps working without it.

| Variable | Needed for |
| --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION` | Loading content from Sanity |
| `SANITY_REVALIDATE_SECRET` | Instant updates after publishing in Studio |
| `SANITY_INTERNAL_TOKEN` | Saving contact form messages to the private `internal` dataset |
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` | Sending contact form email |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY` | Contact form spam protection |
| `NEXT_PUBLIC_SITE_URL` | The site's public address, used in links and share previews (default `https://esfworld.us`) |
| `NEXT_PUBLIC_ALLOW_INDEXING` | Set to `true` to let search engines index the site (off by default) |

### Deploying

Push to `main` and Vercel builds and publishes it. Content changes made in
Studio don't need a deploy.

---

## Known gaps

- The `esfworld.us` domain is bought but not yet connected to Vercel, and
  search engine indexing is off until it is.
- Spanish and French bulletins and sermons are supported, but none have been
  published yet.
- Sections further down the page fade in with JavaScript, so they stay hidden
  if JavaScript is turned off.
