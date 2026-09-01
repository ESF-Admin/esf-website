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
  *[_type == "bulletin" && locale == $locale] | order(date desc) {
    date,
    title,
    scripture,
    "fileUrl": file.asset->url,
    "pdfUrl": pdf.asset->url
  }
`;

const SERMONS_QUERY = /* groq */ `
  *[_type == "sermon" && locale == $locale] | order(date desc) {
    date,
    title,
    scripture,
    speaker,
    "fileUrl": file.asset->url,
    "pdfUrl": pdf.asset->url
  }
`;

export async function getBulletins(locale: DocLocale): Promise<BulletinEntry[]> {
  const client = getSanityClient();
  if (!client) return [];

  return client.fetch<BulletinDoc[]>(
    BULLETINS_QUERY,
    { locale },
    { next: { tags: ["bulletin"] } },
  );
}

export async function getSermons(locale: DocLocale): Promise<SermonEntry[]> {
  const client = getSanityClient();
  if (!client) return [];

  return client.fetch<SermonDoc[]>(
    SERMONS_QUERY,
    { locale },
    { next: { tags: ["sermon"] } },
  );
}
