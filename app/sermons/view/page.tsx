import type { Metadata } from "next";
import { DocumentViewer } from "@/components/document-viewer";

export const metadata: Metadata = { title: "Sermon" };

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
