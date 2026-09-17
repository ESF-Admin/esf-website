import { createClient, type SanityClient } from "next-sanity";
import { apiVersion, projectId } from "@/sanity/env";

const INTERNAL_DATASET = "internal";

let cached: SanityClient | null | undefined;

/**
 * Server-only client for the private "internal" dataset (contact
 * submissions) — never import this from a Client Component, it carries a
 * write-scoped token. Returns null (never throws) until
 * SANITY_INTERNAL_TOKEN / NEXT_PUBLIC_SANITY_PROJECT_ID are set, same
 * degrade-don't-throw convention as lib/sanity/client.ts.
 */
export function getInternalSanityClient(): SanityClient | null {
  if (cached !== undefined) return cached;

  const token = process.env.SANITY_INTERNAL_TOKEN;
  cached =
    projectId && token
      ? createClient({
          projectId,
          dataset: INTERNAL_DATASET,
          apiVersion,
          token,
          useCdn: false,
        })
      : null;

  return cached;
}
