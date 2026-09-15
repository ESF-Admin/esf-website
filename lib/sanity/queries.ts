import { defineQuery } from "next-sanity";
import { getSanityClient } from "./client";
import { withDefaults } from "./defaults";
import {
  org,
  service,
  footerBlurb,
  navCtaLabel,
  navLinks,
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
};

const SITE_SETTINGS_QUERY = defineQuery(`*[_id == "siteSettings"][0]`);

export type SiteSettings = {
  org: typeof org;
  service: typeof service;
  footerBlurb: string;
  navCtaLabel: string;
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
    { org, service, footerBlurb, navCtaLabel },
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
