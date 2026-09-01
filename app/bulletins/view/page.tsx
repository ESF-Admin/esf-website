import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { Nav } from "@/components/nav";

export const metadata: Metadata = { title: "Bulletin" };

// Only ever embed files we actually host — keeps this route from being
// usable as an open redirector/frame for arbitrary third-party URLs.
function isTrustedFileUrl(url: string) {
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === "https:" && hostname.endsWith(".sanity.io");
  } catch {
    return false;
  }
}

export default async function BulletinViewPage({
  searchParams,
}: {
  searchParams: Promise<{ src?: string; title?: string }>;
}) {
  const { src, title } = await searchParams;
  if (!src || !isTrustedFileUrl(src)) notFound();

  const viewerSrc = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(src)}`;

  return (
    <>
      <Nav />
      <main id="main" className="flex h-dvh flex-col pt-20">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-5 py-3 sm:px-8">
          <Link
            href="/bulletins?lang=en"
            className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            <ArrowLeft aria-hidden className="size-4" />
            Back to bulletins
          </Link>
          <p className="min-w-0 flex-1 truncate text-center text-sm font-semibold sm:text-base">
            {title || "Bulletin"}
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
          title={title ? `Bulletin: ${title}` : "Bulletin document"}
          src={viewerSrc}
          className="min-h-0 flex-1"
        />
      </main>
    </>
  );
}
