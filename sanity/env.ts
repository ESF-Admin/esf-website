// Read-only, non-throwing on purpose: this file loads at module-evaluation
// time for every route (including ones that never touch Sanity), so a build
// or `next dev` with no Sanity project configured yet must not crash. Callers
// that actually need data (lib/sanity/queries.ts) check for an empty
// projectId themselves and degrade to an empty result instead.
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01";

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
