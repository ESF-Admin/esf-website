import { sermons } from "@/lib/content";
import { getSermons } from "@/lib/sanity/queries";
import { DocumentTeaser } from "./document-teaser";

export async function Sermons() {
  const latest = (await getSermons("en")).slice(0, 3);

  return (
    <DocumentTeaser
      id="sermon"
      title={sermons.title}
      subtitle={sermons.subtitle}
      entries={latest}
      basePath="/sermons"
      emptyText="Sermons will appear here once published."
      archiveLinkText="View the full sermon archive"
      tinted={false}
    />
  );
}
