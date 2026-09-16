// Mirrors sanity/schemaTypes/shared.ts's HREF_RE (kept as a separate copy —
// that file is bundled into Sanity Studio, this one into the Next.js app,
// and neither needs the other's build graph). Schema-level validation only
// runs inside Studio's editing UI; a document written directly via the
// Sanity API or Vision skips it entirely, so every CMS-sourced href must be
// re-checked here, at the point it's about to become an href attribute —
// not just trusted because the schema *could* have blocked it.
const HREF_RE = /^(https?:\/\/|mailto:|tel:|\/|#)/i;

export function isSafeHref(href: unknown): href is string {
  return typeof href === "string" && HREF_RE.test(href);
}

/** Use directly in JSX: `<a href={safeHref(cta.href)}>`. Never trust a CMS href object by the time it reaches a template. */
export function safeHref(href: unknown, fallback = "#"): string {
  return isSafeHref(href) ? href : fallback;
}
