import type { MetadataRoute } from "next";
import { allowIndexing, siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: allowIndexing
      ? { userAgent: "*", allow: "/", disallow: ["/studio", "/internal", "/api/"] }
      : { userAgent: "*", disallow: "/" },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
