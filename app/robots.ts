import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://esfworld.us";
const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: allowIndexing ? "/" : undefined, disallow: allowIndexing ? "/studio" : "/" },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
