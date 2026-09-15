import { defineField, defineType } from "sanity";
import { hrefField } from "./shared";

/**
 * Singleton — one fixed-id document holding org contact details, the
 * Sunday service time, and small footer/nav chrome text. Locked against
 * duplicate/delete in sanity.config.ts (see sanity/structure.ts).
 */
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({
      name: "orgName",
      title: "Organization name",
      type: "string",
      description: 'Full name, e.g. "Evangelical Student Fellowship".',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: "shortName",
      title: "Short name",
      type: "string",
      description: 'Used where space is tight, e.g. "ESF".',
      validation: (rule) => rule.required().max(20),
    }),
    defineField({
      name: "legalFooterName",
      title: "Legal name (footer copyright line)",
      type: "string",
      description: 'Shown after "© 2026" in the footer.',
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: "phone",
      title: "Phone number (as shown)",
      type: "string",
      description: 'e.g. "+1 (773) 802-1112".',
      validation: (rule) => rule.required(),
    }),
    hrefField("phoneHref", "Phone number (tap-to-call link)"),
    defineField({
      name: "email",
      title: "Email address (as shown)",
      type: "string",
      validation: (rule) => rule.required().email(),
    }),
    hrefField("emailHref", "Email address (tap-to-email link)"),
    defineField({
      name: "address",
      title: "Street address",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    hrefField("mapUrl", "Google Maps link"),
    defineField({
      name: "copyrightYear",
      title: "Copyright year",
      type: "number",
      validation: (rule) => rule.required().integer().min(2000).max(2100),
    }),
    defineField({
      name: "serviceDay",
      title: "Sunday service day",
      type: "string",
      description: 'Usually "Sunday" — the word shown before "Service".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "serviceTime",
      title: "Sunday service time",
      type: "string",
      description: 'e.g. "11:30 AM".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "serviceNote",
      title: "Sunday service note",
      type: "string",
      description: 'A short line under the time, e.g. "Join us in-person."',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: "footerBlurb",
      title: "Footer description",
      type: "text",
      rows: 3,
      description: "Short description shown under the logo in the footer.",
      validation: (rule) => rule.max(280),
    }),
    defineField({
      name: "navCtaLabel",
      title: '"Get in touch" button label',
      type: "string",
      description: "The button in the top navigation and mobile menu.",
      validation: (rule) => rule.max(30),
    }),
    defineField({
      name: "defaultSeo",
      title: "Default search & sharing",
      type: "seo",
      description:
        "Fallback title/description for the site as a whole (used by the homepage and anywhere else without its own).",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Site settings" }),
  },
});
