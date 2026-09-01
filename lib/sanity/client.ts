import { createClient, type SanityClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";

let cached: SanityClient | null | undefined;

/**
 * Returns null (never throws) until NEXT_PUBLIC_SANITY_PROJECT_ID is set, so
 * routes that read bulletins keep building and rendering — with an empty
 * result — before the Sanity project is provisioned.
 */
export function getSanityClient(): SanityClient | null {
  if (cached !== undefined) return cached;

  cached = projectId
    ? createClient({ projectId, dataset, apiVersion, useCdn: true })
    : null;

  return cached;
}
