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
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const active: DocLocale = isLocale(lang) ? lang : "en";
  const entries = await getSermons(active);

  return (
    <DocumentArchive
      eyebrow="Sermon archive"
      title="Sermons"
      intro="Every Sunday sermon message, most recent first."
      basePath="/sermons"
      tabsLabel="Sermon language"
      active={active}
      entries={entries}
      emptyText="No sermons have been published in this language yet."
    />
  );
}
