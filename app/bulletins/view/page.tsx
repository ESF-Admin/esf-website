import type { Metadata } from "next";
import { DocumentViewer } from "@/components/document-viewer";

// Thin wrapper around one file, reached with a ?src= query: keep it out of
// search results but let crawlers follow its links.
export const metadata: Metadata = { title: "Bulletin", robots: { index: false, follow: true } };

export default async function BulletinViewPage({
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
      backHref="/bulletins?lang=en"
      backLabel="Back to bulletins"
      kindLabel="Bulletin"
    />
  );
}
