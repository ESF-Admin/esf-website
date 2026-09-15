import type { Metadata } from "next";
import { DocumentArchive } from "@/components/document-archive";
import { docLocales, pageSeoDefaults, type DocLocale } from "@/lib/content";
import { getSermons, getPage } from "@/lib/sanity/queries";
import { pageMetadata } from "@/lib/seo";

const FALLBACK = {
  eyebrow: "Sermon archive",
  title: "Sermons",
  intro: "Every Sunday sermon message, most recent first.",
  tabsLabel: "Sermon language",
  emptyText: "No sermons have been published in this language yet.",
  seo: pageSeoDefaults.sermons,
};

export async function generateMetadata(): Promise<Metadata> {
  const data = await getPage("sermons", FALLBACK);
  return pageMetadata({
    title: data.seo.title,
    description: data.seo.description,
    path: "/sermons",
  });
}

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
  const [data, { entries, total }] = await Promise.all([
    getPage("sermons", FALLBACK),
    getSermons(active, page),
  ]);

  return (
    <DocumentArchive
      eyebrow={data.eyebrow}
      title={data.title}
      intro={data.intro}
      basePath="/sermons"
      tabsLabel={data.tabsLabel}
      active={active}
      entries={entries}
      total={total}
      page={page}
      emptyText={data.emptyText}
    />
  );
}
