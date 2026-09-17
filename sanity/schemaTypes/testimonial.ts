import { defineField, defineType } from "sanity";
import { orderField } from "./shared";

export const testimonial = defineType({
  name: "testimonial",
  title: "Student story",
  type: "document",
  fields: [
    defineField({
      name: "quote",
      title: "Quote",
      type: "text",
      rows: 4,
      validation: (rule) => rule.required().max(400),
    }),
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      description: 'Use a first name only, or "Student name" to keep it anonymous.',
      validation: (rule) =>
        rule
          .required()
          .max(60)
          .custom((value: string | undefined) =>
            value && /\s/.test(value.trim()) && !/^student name$/i.test(value.trim())
              ? 'Consider a first name only (or "Student name") to keep this anonymous.'
              : true,
          )
          .warning(),
    }),
    defineField({
      name: "role",
      title: "Role",
      type: "string",
      description: 'e.g. "Undergraduate · Class of 2027".',
      validation: (rule) => rule.required().max(80),
    }),
    orderField(),
  ],
  orderings: [
    { title: "Display order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "name", subtitle: "quote" },
  },
});
