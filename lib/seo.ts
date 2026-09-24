import type { Metadata } from "next";
import { org } from "@/lib/content";

/**
 * Public site address, no trailing slash (an env value like
 * "https://www.esfworld.us/" would otherwise produce "//sitemap.xml").
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.esfworld.us"
).replace(/\/+$/, "");

export const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";

/**
 * Site-wide <meta name="keywords">. Google ignores this tag and Bing gives it
 * little weight; it's kept as a reference list of the terms people search
 * for, which should also appear naturally in titles, headings and page copy.
 */
export const siteKeywords = [
  // Name searches
  "Evangelical Student Fellowship",
  "ESF",
  "ESF Chicago",
  "ESF church",
  "Evangelical Student Fellowship Chicago",
  // Church and location
  "church in Chicago",
  "Christian church Chicago",
  "evangelical church Chicago",
  "multi-ethnic church Chicago",
  "Sunday worship service Chicago",
  "Northwest Side Chicago church",
  // Ministry
  "campus ministry",
  "college ministry",
  "Christian student fellowship",
  "Christian student ministry",
  "university students Christian fellowship",
  "young adults ministry",
  "Bible study",
  "evangelism",
  "discipleship",
  "youth and children ministry",
  "world missions",
  // Content
  "Sunday bulletin",
  "sermons",
];

/**
 * Open Graph fields every page shares. Next.js merges metadata shallowly, so
 * a page that sets its own `openGraph` loses the root layout's unless they're
 * repeated here.
 */
export const openGraphBase = {
  type: "website",
  siteName: org.name,
  locale: "en_US",
  images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: org.name }],
} satisfies Metadata["openGraph"];

/**
 * Per-page metadata: its own title, description and canonical URL, plus the
 * shared Open Graph/Twitter fields. `path` is relative ("/bulletins"); Next
 * resolves it against `metadataBase` (set in app/layout.tsx).
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
  const socialTitle = `${title} | ${org.name}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { ...openGraphBase, title: socialTitle, description, url: path },
    twitter: { card: "summary_large_image", title: socialTitle, description },
  };
}
