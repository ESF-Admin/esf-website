import type { Metadata } from "next";
import { DocumentViewer } from "@/components/document-viewer";

// Thin wrapper around one file, reached with a ?src= query: keep it out of
// search results but let crawlers follow its links.
export const metadata: Metadata = { title: "Sermon", robots: { index: false, follow: true } };

export default async function SermonViewPage({
  searchParams,
}: {
  searchParams: Promise<{ src?: string; title?: string; type?: string }>;
}) {
  const { src, title, type } = await searchParams;

  return (
    <DocumentViewer
      src={src}
      title={title}
      type={type}
      backHref="/sermons?lang=en"
      backLabel="Back to sermons"
      kindLabel="Sermon"
    />
  );
}
