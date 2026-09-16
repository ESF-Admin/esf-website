import { defineField, defineType } from "sanity";
import { fileTypeValidator, fileSizeValidator } from "./shared";

const MAX_HERO_VIDEO_BYTES = 15_000_000;

type HeroParent = { video?: { asset?: unknown } };

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
        defineField({
          name: "video",
          title: "Background video",
          type: "file",
          options: { accept: "video/mp4,video/webm" },
          description:
            "Short, silent, looping video behind the hero. Keep it small — under 15MB — since it autoplays for every visitor. Optional; the decorative illustration shows instead when empty.",
          validation: (rule) =>
            rule
              .custom(
                fileTypeValidator("MP4 or WebM video", ["video/mp4", "video/webm"], ["mp4", "webm"]),
              )
              .custom(fileSizeValidator(MAX_HERO_VIDEO_BYTES)),
        }),
        defineField({
          name: "poster",
          title: "Video poster image",
          type: "imageWithAlt",
          description:
            "Shown while the video loads, and instead of the video for visitors whose device requests reduced motion. Required when a background video is set.",
          validation: (rule) =>
            rule.custom((value, context) => {
              const parent = context.parent as HeroParent | undefined;
              return parent?.video?.asset && !value
                ? "Add a poster image — required when a background video is set."
                : true;
            }),
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
          type: "richText",
          description: "Keep it short — this renders as large, centered display text.",
          validation: (rule) => rule.required(),
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
    defineField({
      name: "testimonials",
      title: "Student Stories section",
      type: "object",
      description: "The stories themselves are separate \"Student story\" documents.",
      fields: [
        defineField({
          name: "title",
          title: "Heading",
          type: "string",
          validation: (rule) => rule.required().max(60),
        }),
        defineField({
          name: "subtitle",
          title: "Subtitle",
          type: "text",
          rows: 2,
          validation: (rule) => rule.max(160),
        }),
        defineField({
          name: "showPlaceholderBadge",
          title: "Show \"Placeholder content\" badge",
          type: "boolean",
          description: "Turn this off once real student stories are published below.",
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Home page" }),
  },
});
