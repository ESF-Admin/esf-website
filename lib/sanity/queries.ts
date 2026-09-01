import { getSanityClient } from "./client";
import type { BulletinEntry, BulletinLocale } from "@/lib/content";

type BulletinDoc = {
  date: string;
  title: string;
  scripture?: string;
  fileUrl?: string;
  pdfUrl?: string;
};

const BULLETINS_QUERY = /* groq */ `
  *[_type == "bulletin" && locale == $locale] | order(date desc) {
    date,
    title,
    scripture,
    "fileUrl": file.asset->url,
    "pdfUrl": pdf.asset->url
  }
`;

function toEntry(doc: BulletinDoc): BulletinEntry {
  return {
    date: doc.date,
    title: doc.title,
    scripture: doc.scripture,
    fileUrl: doc.fileUrl,
    pdfUrl: doc.pdfUrl,
  };
}

export async function getBulletins(locale: BulletinLocale): Promise<BulletinEntry[]> {
  const client = getSanityClient();
  if (!client) return [];

  const docs = await client.fetch<BulletinDoc[]>(
    BULLETINS_QUERY,
    { locale },
    { next: { tags: ["bulletin"] } },
  );
  return docs.map(toEntry);
}
