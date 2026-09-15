import type { Metadata } from "next";
import { DocumentArchive } from "@/components/document-archive";
import { docLocales, pageSeoDefaults, type DocLocale } from "@/lib/content";
import { getBulletins, getPage } from "@/lib/sanity/queries";
import { pageMetadata } from "@/lib/seo";

const FALLBACK = {
  eyebrow: "Bulletin archive",
  title: "Bulletins",
  intro: "Every Sunday service bulletin, most recent first.",
  tabsLabel: "Bulletin language",
  emptyText: "No bulletins have been published in this language yet.",
  seo: pageSeoDefaults.bulletins,
};

export async function generateMetadata(): Promise<Metadata> {
  const data = await getPage("bulletins", FALLBACK);
  return pageMetadata({
    title: data.seo.title,
    description: data.seo.description,
    path: "/bulletins",
  });
}

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
  const [data, { entries, total }] = await Promise.all([
    getPage("bulletins", FALLBACK),
    getBulletins(active, page),
  ]);

  return (
    <DocumentArchive
      eyebrow={data.eyebrow}
      title={data.title}
      intro={data.intro}
      basePath="/bulletins"
      tabsLabel={data.tabsLabel}
      active={active}
      entries={entries}
      total={total}
      page={page}
      emptyText={data.emptyText}
    />
  );
}
