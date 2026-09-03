import type { Metadata } from "next";

/**
 * Per-page metadata — sets a page-specific canonical + Open Graph title/
 * description/url instead of every inner page inheriting the homepage's
 * from the root layout. `path` is relative ("/bulletins"); Next resolves
 * it against `metadataBase` (set once in app/layout.tsx) into an absolute
 * URL for canonical/og:url.
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path },
    twitter: { title, description },
  };
}
