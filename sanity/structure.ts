import type { StructureResolver } from "sanity/structure";

/**
 * Document types with a fixed `_id` that the admin can never create a
 * second copy of or delete — see sanity.config.ts's `document.actions` /
 * `newDocumentOptions`, which read this same list. `page` is a repeatable
 * *type* but each of its six documents has a fixed, readOnly slug and a
 * deterministic `_id` (seeded by scripts/seed-content.ts), so it's locked
 * the same way a true singleton is: the admin edits the six that exist,
 * never creates a seventh or deletes one of the six.
 */
export const SINGLETON_TYPES = new Set<string>([
  "siteSettings",
  "navigation",
  "homePage",
  "page",
]);

const PAGES: [string, string][] = [
  ["ministries", "Ministries page"],
  ["missions", "Missions page"],
  ["history", "History page"],
  ["contact", "Contact page"],
  ["bulletins", "Bulletins page"],
  ["sermons", "Sermons page"],
];

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
      singleton(S, "homePage", "Home page"),
      S.divider(),
      S.listItem()
        .title("Pages")
        .child(
          S.list()
            .title("Pages")
            .items(
              PAGES.map(([slug, title]) =>
                singleton(S, `page.${slug}`, title, "page"),
              ),
            ),
        ),
      S.divider(),
      S.documentTypeListItem("ministry").title("Ministries"),
      S.documentTypeListItem("missionCountry").title("Mission countries"),
      S.documentTypeListItem("testimonial").title("Student stories"),
      S.divider(),
      S.documentTypeListItem("bulletin").title("Bulletins"),
      S.documentTypeListItem("sermon").title("Sermons"),
    ]);
