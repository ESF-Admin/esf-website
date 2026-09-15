function isEmpty(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  );
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Merges a CMS document over a typed default, key by key: a CMS value wins
 * unless it's empty/missing, in which case the default shows through. Plain
 * objects recurse; arrays replace wholesale (an admin can't yet publish an
 * empty list to intentionally clear one — see lib/content.ts defaults, which
 * should switch to `[]` once real content replaces the placeholder items).
 *
 * This one function is what keeps every page rendering — never blank, never
 * a 500 — whether Sanity is unconfigured (doc is null), a singleton hasn't
 * been created yet (doc is null), or it exists with some fields still empty.
 */
export function withDefaults<T extends object>(fallback: T, doc: unknown): T {
  if (!isPlainObject(doc)) return fallback;

  const merged: Record<string, unknown> = { ...(fallback as Record<string, unknown>) };
  for (const [key, value] of Object.entries(doc)) {
    if (isEmpty(value)) continue;
    const base = (fallback as Record<string, unknown>)[key];
    merged[key] =
      isPlainObject(base) && isPlainObject(value)
        ? withDefaults(base, value)
        : value;
  }
  return merged as T;
}
