import { bulletins } from "@/lib/content";
import { getBulletins } from "@/lib/sanity/queries";
import { DocumentTeaser } from "./document-teaser";

export async function Bulletins() {
  const latest = (await getBulletins("en")).slice(0, 3);

  return (
    <DocumentTeaser
      id="bulletins"
      title={bulletins.title}
      subtitle={bulletins.subtitle}
      entries={latest}
      basePath="/bulletins"
      emptyText="Bulletins will appear here once published."
      archiveLinkText="View the full bulletin archive"
    />
  );
}
