import { defineField, defineType } from "sanity";

/**
 * Singleton — the homepage's hero, mission statement, and closing
 * contact CTA. Locked against duplicate/delete (see sanity/structure.ts).
 */
export const homePage = defineType({
  name: "homePage",
  title: "Home page",
  type: "document",
  fields: [
    defineField({
      name: "hero",
      title: "Hero",
      type: "object",
      fields: [
        defineField({
          name: "eyebrow",
          title: "Eyebrow",
          type: "string",
          description: 'Small label above the headline, e.g. "Campus ministry since 1976".',
          validation: (rule) => rule.max(60),
        }),
        defineField({
          name: "title",
          title: "Headline",
          type: "string",
          description: "The last word is highlighted in the accent color.",
          validation: (rule) => rule.required().max(60),
        }),
        defineField({
          name: "body",
          title: "Intro text",
          type: "text",
          rows: 3,
          validation: (rule) => rule.required().max(320),
        }),
        defineField({
          name: "primaryCta",
          title: "Primary button",
          type: "cta",
        }),
        defineField({
          name: "secondaryCta",
          title: "Secondary button",
          type: "cta",
        }),
      ],
    }),
    defineField({
      name: "mission",
      title: "Mission statement",
      type: "object",
      fields: [
        defineField({
          name: "title",
          title: "Label",
          type: "string",
          description: 'e.g. "Our Mission" — shown small, above the statement.',
          validation: (rule) => rule.required().max(60),
        }),
        defineField({
          name: "statement",
          title: "Statement",
          type: "text",
          rows: 4,
          validation: (rule) => rule.required().max(500),
        }),
      ],
    }),
    defineField({
      name: "contactCta",
      title: "Closing contact section",
      type: "object",
      fields: [
        defineField({
          name: "title",
          title: "Heading",
          type: "string",
          validation: (rule) => rule.required().max(100),
        }),
        defineField({
          name: "subtitle",
          title: "Subtitle",
          type: "text",
          rows: 2,
          validation: (rule) => rule.max(200),
        }),
        defineField({
          name: "cta",
          title: "Button",
          type: "cta",
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Home page" }),
  },
});
