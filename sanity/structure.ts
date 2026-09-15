import type { StructureResolver } from "sanity/structure";

/**
 * Document types with a fixed `_id` that the admin can never create a
 * second copy of or delete — see sanity.config.ts's `document.actions` /
 * `newDocumentOptions`, which read this same list.
 */
export const SINGLETON_TYPES = new Set<string>(["siteSettings", "navigation"]);

/** A list item that opens straight into one fixed-id document, skipping the "which one?" list singletons don't need. */
function singleton(
  S: Parameters<StructureResolver>[0],
  id: string,
  title: string,
  type: string = id,
) {
  return S.listItem()
    .title(title)
    .id(id)
    .child(S.document().schemaType(type).documentId(id).title(title));
}

export const structure: StructureResolver = (S) =>
  S.list()
    .title("ESF website")
    .items([
      singleton(S, "siteSettings", "Site settings"),
      singleton(S, "navigation", "Navigation menu"),
      S.divider(),
      // Phase 2+: homePage singleton and a "Pages" sub-list land here.
      S.documentTypeListItem("bulletin").title("Bulletins"),
      S.documentTypeListItem("sermon").title("Sermons"),
    ]);
