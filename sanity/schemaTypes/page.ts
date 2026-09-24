import { defineField, defineType } from "sanity";
import { pageCopyFields, contentGroups } from "./shared";

const PAGE_SLUGS = [
  "ministries",
  "missions",
  "history",
  "contact",
  "bulletins",
  "sermons",
] as const;

/** Only shows a field in Studio when editing the page(s) it actually applies to. */
function onlyFor(...slugs: (typeof PAGE_SLUGS)[number][]) {
  return {
    hidden: ({ document }: { document?: Record<string, unknown> }) =>
      !slugs.includes(document?.slug as (typeof PAGE_SLUGS)[number]),
  };
}

/**
 * One document type for every simple content page (ministries, missions,
 * history, contact, bulletins, sermons) rather than six near-identical
 * singletons — each is keyed by a fixed, readOnly `slug` (deterministic
 * `_id`s like "page-history", seeded by scripts/seed-content.ts; no dots,
 * since Sanity treats dotted IDs as private and the public client can't read them) and
 * locked against duplicate/delete in sanity.config.ts, same as a true
 * singleton. Page-specific fields (ministries' items, history's timeline)
 * are hidden unless editing that page, via `onlyFor()`.
 */
export const page = defineType({
  name: "page",
  title: "Page",
  type: "document",
  groups: [...contentGroups],
  fields: [
    defineField({
      name: "slug",
      title: "Page",
      type: "string",
      readOnly: true,
      options: { list: [...PAGE_SLUGS] },
      validation: (rule) => rule.required(),
    }),
    ...pageCopyFields(),

    // History page only
    defineField({
      name: "paragraphs",
      title: "Story paragraphs",
      type: "array",
      of: [{ type: "text", rows: 3 }],
      group: "content",
      ...onlyFor("history"),
    }),
    defineField({
      name: "milestones",
      title: "Timeline milestones",
      type: "array",
      group: "content",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "year", title: "Year / period", type: "string", validation: (r) => r.required().max(20) }),
            defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required().max(80) }),
            defineField({ name: "body", title: "Description", type: "text", rows: 2, validation: (r) => r.required().max(240) }),
          ],
          preview: { select: { title: "title", subtitle: "year" } },
        },
      ],
      ...onlyFor("history"),
    }),

    // Bulletins/Sermons archive pages only
    defineField({
      name: "tabsLabel",
      title: "Language tabs label",
      type: "string",
      description: 'Accessible label for the language tab list, e.g. "Bulletin language".',
      group: "content",
      ...onlyFor("bulletins", "sermons"),
    }),
    defineField({
      name: "emptyText",
      title: "Empty-state text",
      type: "string",
      description: "Shown when a language has no published entries yet.",
      group: "content",
      ...onlyFor("bulletins", "sermons"),
    }),
  ],
  preview: {
    select: { title: "title", slug: "slug" },
    prepare: ({ title, slug }: { title?: string; slug?: string }) => ({
      title: title ?? slug ?? "Untitled page",
      subtitle: slug,
    }),
  },
});
