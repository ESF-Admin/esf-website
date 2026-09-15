import { defineQuery } from "next-sanity";
import { getSanityClient } from "./client";
import type { BulletinEntry, SermonEntry, DocLocale } from "@/lib/content";

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
