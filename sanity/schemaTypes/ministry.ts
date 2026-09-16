import { defineField, defineType } from "sanity";
import { orderField } from "./shared";
import { ICON_NAMES } from "../../lib/icon-map";

export const ministry = defineType({
  name: "ministry",
  title: "Ministry",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: "body",
      title: "Description",
      type: "text",
      rows: 2,
      validation: (rule) => rule.required().max(240),
    }),
    defineField({
      name: "icon",
      title: "Icon",
      type: "string",
      options: { list: [...ICON_NAMES] },
      validation: (rule) => rule.required(),
    }),
    orderField(),
  ],
  orderings: [
    { title: "Display order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "name", subtitle: "body" },
  },
});
