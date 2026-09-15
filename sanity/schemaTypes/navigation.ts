import { defineField, defineType } from "sanity";

/**
 * Singleton — the top nav's items, in order. Each item's `children` are a
 * plain editable list for now (matching lib/content.ts's navLinks exactly);
 * `childSource` on the `navItem` object exists for a later phase to
 * auto-generate a dropdown from ministry/mission-country documents once
 * those exist — until then it's informational only, editors keep using
 * the manual list.
 */
export const navigation = defineType({
  name: "navigation",
  title: "Navigation menu",
  type: "document",
  fields: [
    defineField({
      name: "items",
      title: "Menu items",
      type: "array",
      of: [{ type: "navItem" }],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    prepare: () => ({ title: "Navigation menu" }),
  },
});
