import { defineField, defineType } from "sanity";

/**
 * `alt` is required with no fallback anywhere it's rendered — an
 * unlabelled image is an accessibility bug, not a style choice.
 */
export const imageWithAlt = defineType({
  name: "imageWithAlt",
  title: "Image",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      title: "Alt text",
      type: "string",
      description:
        "Describe the picture for someone who can't see it, e.g. \"Students praying together in the chapel.\" Required.",
      validation: (rule) => rule.required().max(160),
    }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "string",
      description: "Optional short caption shown under the image.",
      validation: (rule) => rule.max(160),
    }),
  ],
});
