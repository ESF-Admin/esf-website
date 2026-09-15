import { defineField, defineType } from "sanity";
import { hrefField } from "../shared";

/**
 * `name` selects which hardcoded brand icon renders (components/socials.tsx
 * owns that map) — it's a closed enum, not free text, because the icon set
 * is fixed in code. Adding a platform needs a code change either way; this
 * keeps that explicit instead of silently rendering no icon.
 */
export const SOCIAL_NAMES = [
  "Facebook",
  "X",
  "YouTube",
  "Instagram",
  "LinkedIn",
] as const;

export const socialLink = defineType({
  name: "socialLink",
  title: "Social link",
  type: "object",
  fields: [
    defineField({
      name: "name",
      title: "Platform",
      type: "string",
      options: { list: [...SOCIAL_NAMES] },
      validation: (rule) => rule.required(),
    }),
    hrefField(),
    defineField({
      name: "label",
      title: "Accessible label",
      type: "string",
      description: 'Read by screen readers, e.g. "ESF on Facebook".',
      validation: (rule) => rule.required().max(80),
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "href" },
  },
});
