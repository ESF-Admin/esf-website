import { defineField, defineType } from "sanity";
import { orderField } from "./shared";

export const missionCountry = defineType({
  name: "missionCountry",
  title: "Mission country",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Country",
      type: "string",
      validation: (rule) => rule.required().max(60),
    }),
    orderField(),
  ],
  orderings: [
    { title: "Display order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "name" },
  },
});
