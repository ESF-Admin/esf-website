import type { Metadata } from "next";
import { DocumentArchive } from "@/components/document-archive";
import { docLocales, type DocLocale } from "@/lib/content";
import { getSermons } from "@/lib/sanity/queries";

export const metadata: Metadata = {
  title: "Sermons",
  description:
    "The full archive of ESF Sunday sermon messages, most recent first.",
};

function isLocale(value: string | undefined): value is DocLocale {
  return docLocales.some((l) => l.code === value);
}

export default async function SermonsPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string; page?: string }>;
}) {
  const { lang, page: pageParam } = await searchParams;
  const active: DocLocale = isLocale(lang) ? lang : "en";
  const page = Math.max(1, Number(pageParam) || 1);
  const { entries, total } = await getSermons(active, page);

  return (
    <DocumentArchive
      eyebrow="Sermon archive"
      title="Sermons"
      intro="Every Sunday sermon message, most recent first."
      basePath="/sermons"
      tabsLabel="Sermon language"
      active={active}
      entries={entries}
      total={total}
      page={page}
      emptyText="No sermons have been published in this language yet."
    />
  );
}
