import { defineField, defineType } from "sanity";
import { hrefField } from "../shared";

export const ctaObject = defineType({
  name: "cta",
  title: "Button",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Button text",
      type: "string",
      validation: (rule) => rule.required().max(40),
    }),
    hrefField(),
  ],
  preview: {
    select: { title: "label", subtitle: "href" },
  },
});
