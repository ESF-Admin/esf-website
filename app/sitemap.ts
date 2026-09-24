import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

const routes = ["", "/bulletins", "/sermons", "/ministries", "/missions", "/history", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((path) => ({ url: `${siteUrl}${path}` }));
}
