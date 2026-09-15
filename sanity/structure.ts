import type { StructureResolver } from "sanity/structure";

/**
 * Document types with a fixed `_id` that the admin can never create a
 * second copy of or delete — see sanity.config.ts's `document.actions` /
 * `newDocumentOptions`, which read this same list. Empty for now; grows as
 * singleton content types (site settings, navigation, home page, and the
 * slug-keyed `page` type) land in later phases.
 */
export const SINGLETON_TYPES = new Set<string>([]);

export const structure: StructureResolver = (S) =>
  S.list()
    .title("ESF website")
    .items([
      // Phase 1+: siteSettings, navigation, homePage singletons and a
      // "Pages" sub-list land here.
      S.documentTypeListItem("bulletin").title("Bulletins"),
      S.documentTypeListItem("sermon").title("Sermons"),
    ]);
