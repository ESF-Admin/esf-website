import { defineField, defineType } from "sanity";

export const seoObject = defineType({
  name: "seo",
  title: "Search & sharing",
  type: "object",
  description:
    "Controls how this page looks in Google search results and when shared as a link. Leave blank to use the site default.",
  fields: [
    defineField({
      name: "title",
      title: "Search engine title",
      type: "string",
      validation: (rule) => rule.max(70),
    }),
    defineField({
      name: "description",
      title: "Search engine description",
      type: "text",
      rows: 2,
      validation: (rule) => rule.max(200),
    }),
  ],
});
