import { getSanityClient } from "./client";
import type { BulletinEntry, SermonEntry, DocLocale } from "@/lib/content";

type BulletinDoc = {
  date: string;
  title: string;
  scripture?: string;
  fileUrl?: string;
  pdfUrl?: string;
};

type SermonDoc = BulletinDoc & { speaker?: string };

const BULLETINS_QUERY = /* groq */ `
  *[_type == "bulletin" && locale == $locale] | order(date desc) [$start...$end] {
    date,
    title,
    scripture,
    "fileUrl": file.asset->url,
    "pdfUrl": pdf.asset->url
  }
`;

const SERMONS_QUERY = /* groq */ `
  *[_type == "sermon" && locale == $locale] | order(date desc) [$start...$end] {
    date,
    title,
    scripture,
    speaker,
    "fileUrl": file.asset->url,
    "pdfUrl": pdf.asset->url
  }
`;

const BULLETINS_COUNT_QUERY = /* groq */ `
  count(*[_type == "bulletin" && locale == $locale])
`;

const SERMONS_COUNT_QUERY = /* groq */ `
  count(*[_type == "sermon" && locale == $locale])
`;

export const DOCS_PER_PAGE = 12;

export type Page<T> = { entries: T[]; total: number };

export async function getBulletins(
  locale: DocLocale,
  page = 1,
): Promise<Page<BulletinEntry>> {
  const client = getSanityClient();
  if (!client) return { entries: [], total: 0 };

  const start = (page - 1) * DOCS_PER_PAGE;
  // revalidate is a 60s safety net; the Sanity webhook (see
  // app/api/revalidate/route.ts) calls revalidateTag for near-instant
  // updates on publish/delete — without either, a statically-rendered
  // page (like "/") would keep whatever it fetched at build time forever.
  const opts = { next: { tags: ["bulletin"], revalidate: 60 } };
  const [entries, total] = await Promise.all([
    client.fetch<BulletinDoc[]>(BULLETINS_QUERY, { locale, start, end: start + DOCS_PER_PAGE }, opts),
    client.fetch<number>(BULLETINS_COUNT_QUERY, { locale }, opts),
  ]);
  return { entries, total };
}

export async function getSermons(
  locale: DocLocale,
  page = 1,
): Promise<Page<SermonEntry>> {
  const client = getSanityClient();
  if (!client) return { entries: [], total: 0 };

  const start = (page - 1) * DOCS_PER_PAGE;
  const opts = { next: { tags: ["sermon"], revalidate: 60 } };
  const [entries, total] = await Promise.all([
    client.fetch<SermonDoc[]>(SERMONS_QUERY, { locale, start, end: start + DOCS_PER_PAGE }, opts),
    client.fetch<number>(SERMONS_COUNT_QUERY, { locale }, opts),
  ]);
  return { entries, total };
}
