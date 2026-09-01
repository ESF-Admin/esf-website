import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { Nav } from "@/components/nav";

// Only ever embed files we actually host — keeps the viewer routes from
// being usable as an open redirector/frame for arbitrary third-party URLs.
function isTrustedFileUrl(url: string) {
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === "https:" && hostname.endsWith(".sanity.io");
  } catch {
    return false;
  }
}

type Props = {
  src?: string;
  title?: string;
  type?: string;
  backHref: string;
  backLabel: string;
  /** Falls back to "Document" in the page heading/iframe title when unset. */
  kindLabel?: string;
};

/** Shared full-page document viewer for both bulletins and sermons. */
export function DocumentViewer({
  src,
  title,
  type,
  backHref,
  backLabel,
  kindLabel = "Document",
}: Props) {
  if (!src || !isTrustedFileUrl(src)) notFound();

  // PDFs render instantly in the browser's own viewer — no round trip. Word
  // documents still need Microsoft's viewer, which is slower (it has to
  // fetch, convert and stream the file back through their own servers).
  const viewerSrc =
    type === "pdf"
      ? src
      : `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(src)}`;

  return (
    <>
      <Nav />
      <main id="main" className="flex h-dvh flex-col pt-20">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-5 py-3 sm:px-8">
          <Link
            href={backHref}
            className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            <ArrowLeft aria-hidden className="size-4" />
            {backLabel}
          </Link>
          <p className="min-w-0 flex-1 truncate text-center text-sm font-semibold sm:text-base">
            {title || kindLabel}
          </p>
          <a
            href={src}
            download
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold transition-colors duration-200 hover:bg-surface-2"
          >
            <Download aria-hidden className="size-4" />
            Download
          </a>
        </div>

        <iframe
          title={title ? `${kindLabel}: ${title}` : kindLabel}
          src={viewerSrc}
          className="min-h-0 flex-1"
        />
      </main>
    </>
  );
}
