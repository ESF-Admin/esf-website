import { defineQuery } from "next-sanity";
import type { PortableTextBlock } from "@portabletext/react";
import { getSanityClient } from "./client";
import { withDefaults } from "./defaults";
import { plainTextToBlocks } from "./portable-text";
import type { SanityImageData } from "./image";
import {
  org,
  service,
  footerBlurb,
  navCtaLabel,
  navLinks,
  hero,
  mission,
  ministries,
  missions,
  testimonials,
  type BulletinEntry,
  type SermonEntry,
  type DocLocale,
  type NavLink,
} from "@/lib/content";

/**
 * Null-guards the client, tags the fetch by document `_type` (matching
 * app/api/revalidate/route.ts's `revalidateTag(body._type, "max")`), and
 * never throws: a Sanity outage returns `fallback` instead of a 500. Tags
 * are passed explicitly rather than inferred from the query so a query that
 * spans multiple `_type`s (e.g. a combined homepage query) can list all of
 * them and get busted by an edit to any one.
 */
async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown>,
  tags: string[],
  fallback: T,
): Promise<T> {
  const client = getSanityClient();
  if (!client) return fallback;

  try {
    const result = await client.fetch<T>(query, params, {
      next: { tags, revalidate: 60 },
    });
    return result ?? fallback;
  } catch (err) {
    console.error("[sanity] fetch failed", err);
    return fallback;
  }
}

type BulletinDoc = {
  date: string;
  title: string;
  scripture?: string;
  fileUrl?: string;
  pdfUrl?: string;
};

type SermonDoc = BulletinDoc & { speaker?: string };

const BULLETINS_QUERY = defineQuery(`
  *[_type == "bulletin" && locale == $locale] | order(date desc) [$start...$end] {
    date,
    title,
    scripture,
    "fileUrl": file.asset->url,
    "pdfUrl": pdf.asset->url
  }
`);

const SERMONS_QUERY = defineQuery(`
  *[_type == "sermon" && locale == $locale] | order(date desc) [$start...$end] {
    date,
    title,
    scripture,
    speaker,
    "fileUrl": file.asset->url,
    "pdfUrl": pdf.asset->url
  }
`);

const BULLETINS_COUNT_QUERY = defineQuery(`
  count(*[_type == "bulletin" && locale == $locale])
`);

const SERMONS_COUNT_QUERY = defineQuery(`
  count(*[_type == "sermon" && locale == $locale])
`);

export const DOCS_PER_PAGE = 12;

export type Page<T> = { entries: T[]; total: number };

export async function getBulletins(
  locale: DocLocale,
  page = 1,
): Promise<Page<BulletinEntry>> {
  const start = (page - 1) * DOCS_PER_PAGE;
  const params = { locale, start, end: start + DOCS_PER_PAGE };
  const [entries, total] = await Promise.all([
    sanityFetch<BulletinDoc[]>(BULLETINS_QUERY, params, ["bulletin"], []),
    sanityFetch<number>(BULLETINS_COUNT_QUERY, { locale }, ["bulletin"], 0),
  ]);
  return { entries, total };
}

export async function getSermons(
  locale: DocLocale,
  page = 1,
): Promise<Page<SermonEntry>> {
  const start = (page - 1) * DOCS_PER_PAGE;
  const params = { locale, start, end: start + DOCS_PER_PAGE };
  const [entries, total] = await Promise.all([
    sanityFetch<SermonDoc[]>(SERMONS_QUERY, params, ["sermon"], []),
    sanityFetch<number>(SERMONS_COUNT_QUERY, { locale }, ["sermon"], 0),
  ]);
  return { entries, total };
}

type SiteSettingsDoc = {
  orgName?: string;
  shortName?: string;
  legalFooterName?: string;
  phone?: string;
  phoneHref?: string;
  email?: string;
  emailHref?: string;
  address?: string;
  mapUrl?: string;
  copyrightYear?: number;
  serviceDay?: string;
  serviceTime?: string;
  serviceNote?: string;
  footerBlurb?: string;
  navCtaLabel?: string;
  defaultSeo?: { title?: string; description?: string };
};

const SITE_SETTINGS_QUERY = defineQuery(`*[_id == "siteSettings"][0]`);

export type SiteSettings = {
  org: typeof org;
  service: typeof service;
  footerBlurb: string;
  navCtaLabel: string;
  defaultSeo: { title: string; description: string };
};

const DEFAULT_SEO = {
  title: `${org.name} (ESF) — Campus Ministry`,
  description:
    "Evangelical Student Fellowship is an international Christian student ministry on college and university campuses worldwide, and a multi-ethnic ministry in Chicago. Founded in Seoul, Korea in 1976.",
};

/**
 * Site-wide org/contact/service chrome — the siteSettings singleton,
 * merged over lib/content.ts's defaults (see withDefaults) so nav, footer
 * and the Sunday-service section never blank whether Sanity is
 * unconfigured, the singleton hasn't been created yet, or some of its
 * fields are still empty.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  const doc = await sanityFetch<SiteSettingsDoc | null>(
    SITE_SETTINGS_QUERY,
    {},
    ["siteSettings"],
    null,
  );

  return withDefaults(
    { org, service, footerBlurb, navCtaLabel, defaultSeo: DEFAULT_SEO },
    doc && {
      org: {
        name: doc.orgName,
        shortName: doc.shortName,
        legalFooterName: doc.legalFooterName,
        phone: doc.phone,
        phoneHref: doc.phoneHref,
        email: doc.email,
        emailHref: doc.emailHref,
        address: doc.address,
        mapUrl: doc.mapUrl,
        copyrightYear: doc.copyrightYear,
      },
      service: {
        day: doc.serviceDay,
        time: doc.serviceTime,
        note: doc.serviceNote,
      },
      footerBlurb: doc.footerBlurb,
      navCtaLabel: doc.navCtaLabel,
      defaultSeo: doc.defaultSeo,
    },
  );
}

type NavigationDoc = { items?: NavLink[] };

const NAVIGATION_QUERY = defineQuery(`
  *[_id == "navigation"][0]{
    items[]{ label, href, children[]{ label, href } }
  }
`);

/**
 * The top nav's items — the navigation singleton's `items` list, or
 * lib/content.ts's navLinks if the singleton is missing/unconfigured/empty.
 * Unlike getSiteSettings(), this isn't a field-by-field merge: the whole
 * list is either the CMS's or the default's, since a partial edit (e.g.
 * renaming one item) is expected to be published as a complete document,
 * not a diff against the fallback.
 */
export async function getNavigation(): Promise<NavLink[]> {
  const doc = await sanityFetch<NavigationDoc | null>(
    NAVIGATION_QUERY,
    {},
    ["navigation"],
    null,
  );
  return doc?.items?.length ? doc.items : [...navLinks];
}

type CtaDoc = { label?: string; href?: string };

type HomePageDoc = {
  hero?: {
    eyebrow?: string;
    title?: string;
    body?: string;
    primaryCta?: CtaDoc;
    secondaryCta?: CtaDoc;
    video?: string;
    poster?: SanityImageData | null;
  };
  mission?: { title?: string; statement?: PortableTextBlock[] };
  contactCta?: { title?: string; subtitle?: string; cta?: CtaDoc };
  testimonials?: { title?: string; subtitle?: string; showPlaceholderBadge?: boolean };
};

// The GROQ image field selection shared by anything that projects an
// `imageWithAlt` field: `...` keeps the raw image (asset ref, hotspot,
// crop) that urlFor() needs to build a URL, alongside `alt`/`caption` and
// the two fields only obtainable by dereferencing the asset — `dim`
// (next/image requires width/height up front) and `lqip` (blur placeholder).
const IMAGE_FIELDS = `{ ..., alt, caption, "lqip": asset->metadata.lqip, "dim": asset->metadata.dimensions{width, height} }`;

const HOME_PAGE_QUERY = defineQuery(`
  *[_id == "homePage"][0]{
    ...,
    hero{
      ...,
      "video": video.asset->url,
      poster${IMAGE_FIELDS}
    }
  }
`);

const DEFAULT_CONTACT_CTA = {
  title: "Have a question? We'd love to hear from you.",
  subtitle: "Reach out about a gathering, a ministry, or just to say hello.",
  cta: { label: "Get in touch", href: "/contact" },
};

const DEFAULT_TESTIMONIALS_SECTION = {
  title: testimonials.title,
  subtitle: testimonials.subtitle,
  showPlaceholderBadge: testimonials.placeholder as boolean,
};

/** Present only once a video file AND a poster (with usable dimensions) both exist — never a video with no fallback image. */
export type HeroVideo = { url: string; poster: SanityImageData } | null;

const DEFAULT_MISSION = {
  title: mission.title,
  statement: plainTextToBlocks(mission.statement),
};

export type HomePage = {
  hero: typeof hero;
  heroVideo: HeroVideo;
  mission: typeof DEFAULT_MISSION;
  contactCta: typeof DEFAULT_CONTACT_CTA;
  testimonials: typeof DEFAULT_TESTIMONIALS_SECTION;
};

/**
 * Homepage hero, mission statement, closing contact CTA, and the Student
 * Stories section's heading/badge (the stories themselves come from
 * getTestimonials()) — the homePage singleton, merged over
 * lib/content.ts's defaults. `heroVideo` is handled separately from the
 * field-by-field merge: it's a present-or-absent unit (video + poster
 * together), not a value with a sensible partial fallback.
 */
export async function getHomePage(): Promise<HomePage> {
  const doc = await sanityFetch<HomePageDoc | null>(
    HOME_PAGE_QUERY,
    {},
    ["homePage"],
    null,
  );

  const heroVideo: HeroVideo =
    doc?.hero?.video && doc.hero.poster?.dim && doc.hero.poster.alt
      ? { url: doc.hero.video, poster: doc.hero.poster }
      : null;

  return {
    ...withDefaults(
      {
        hero,
        mission: DEFAULT_MISSION,
        contactCta: DEFAULT_CONTACT_CTA,
        testimonials: DEFAULT_TESTIMONIALS_SECTION,
      },
      doc,
    ),
    heroVideo,
  };
}

const PAGE_QUERY = defineQuery(`*[_type == "page" && slug == $slug][0]`);

/**
 * One of the six simple content pages (ministries, missions, history,
 * contact, bulletins, sermons) — the matching `page` document, merged
 * over a caller-supplied fallback shaped like that page's current
 * lib/content.ts values. Generic because each page's extra fields differ
 * (ministries' `items`, history's `milestones`, etc.) — see sanity/schemaTypes/page.ts.
 */
export async function getPage<T extends object>(
  slug: string,
  fallback: T,
): Promise<T> {
  const doc = await sanityFetch<Record<string, unknown> | null>(
    PAGE_QUERY,
    { slug },
    ["page"],
    null,
  );
  return withDefaults(fallback, doc);
}

type MinistryDoc = { name: string; body: string; icon: string };

const MINISTRIES_QUERY = defineQuery(`
  *[_type == "ministry"] | order(order asc) { name, body, icon }
`);

/**
 * Ministry cards — real `ministry` documents, or lib/content.ts's sample
 * items if none exist yet. Unlike getPage(), this list either comes
 * entirely from Sanity or entirely from the default: an admin publishing
 * even one real ministry is expected to have moved all of them in, not to
 * be topping up a partial default list.
 */
export async function getMinistries(): Promise<MinistryDoc[]> {
  const entries = await sanityFetch<MinistryDoc[]>(
    MINISTRIES_QUERY,
    {},
    ["ministry"],
    [],
  );
  return entries.length
    ? entries
    : ministries.items.map((m, i) => ({ ...m, icon: FALLBACK_MINISTRY_ICONS[i] }));
}

// Positional icon assignment for lib/content.ts's sample ministries only
// (real `ministry` documents always carry their own `icon` field) — kept
// here, not in lib/content.ts, since it's purely a fallback-rendering
// detail tied to how getMinistries() shapes its result.
const FALLBACK_MINISTRY_ICONS = ["church", "handHeart", "book", "baby"];

const MISSION_COUNTRIES_QUERY = defineQuery(`
  *[_type == "missionCountry"] | order(order asc) { name }
`);

/**
 * Mission-country pills — real `missionCountry` documents, or
 * lib/content.ts's sample list if none exist yet.
 */
export async function getMissionCountries(): Promise<string[]> {
  const entries = await sanityFetch<{ name: string }[]>(
    MISSION_COUNTRIES_QUERY,
    {},
    ["missionCountry"],
    [],
  );
  return entries.length ? entries.map((c) => c.name) : [...missions.countries];
}

type TestimonialDoc = { quote: string; name: string; role: string };

const TESTIMONIALS_QUERY = defineQuery(`
  *[_type == "testimonial"] | order(order asc) { quote, name, role }
`);

/**
 * Student-story carousel entries — real `testimonial` documents, or
 * lib/content.ts's sample quotes if none exist yet.
 */
export async function getTestimonials(): Promise<TestimonialDoc[]> {
  const entries = await sanityFetch<TestimonialDoc[]>(
    TESTIMONIALS_QUERY,
    {},
    ["testimonial"],
    [],
  );
  return entries.length ? entries : [...testimonials.items];
}
