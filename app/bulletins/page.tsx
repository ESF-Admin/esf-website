import type { Metadata } from "next";
import { DocumentArchive } from "@/components/document-archive";
import { docLocales, type DocLocale } from "@/lib/content";
import { getBulletins } from "@/lib/sanity/queries";

export const metadata: Metadata = {
  title: "Bulletins",
  description:
    "The full archive of ESF Sunday service bulletins, most recent first.",
};

function isLocale(value: string | undefined): value is DocLocale {
  return docLocales.some((l) => l.code === value);
}

export default async function BulletinsPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string; page?: string }>;
}) {
  const { lang, page: pageParam } = await searchParams;
  const active: DocLocale = isLocale(lang) ? lang : "en";
  const page = Math.max(1, Number(pageParam) || 1);
  const { entries, total } = await getBulletins(active, page);

  return (
    <DocumentArchive
      eyebrow="Bulletin archive"
      title="Bulletins"
      intro="Every Sunday service bulletin, most recent first."
      basePath="/bulletins"
      tabsLabel="Bulletin language"
      active={active}
      entries={entries}
      total={total}
      page={page}
      emptyText="No bulletins have been published in this language yet."
    />
  );
}
