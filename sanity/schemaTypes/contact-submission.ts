import { defineField, defineType } from "sanity";

/**
 * Lives only in the private "internal" dataset (see
 * lib/sanity/internal-client.ts) — deliberately NOT added to
 * sanity/schemaTypes/index.ts, which backs the public "production" dataset
 * read with no auth token (lib/sanity/client.ts). Keeping this type out of
 * that array means the default Studio workspace can never be used to
 * accidentally create a submission document in the public dataset.
 */
export const contactSubmission = defineType({
  name: "contactSubmission",
  title: "Contact submission",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (rule) => rule.required().max(200),
    }),
    defineField({
      name: "phone",
      title: "Phone",
      type: "string",
      validation: (rule) => rule.max(30),
    }),
    defineField({
      name: "message",
      title: "Message",
      type: "text",
      rows: 6,
      validation: (rule) => rule.required().max(5000),
    }),
    defineField({
      name: "submittedAt",
      title: "Submitted at",
      type: "datetime",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "ip",
      title: "IP address",
      type: "string",
      description: "Captured for abuse investigation only.",
    }),
  ],
  orderings: [
    {
      title: "Newest first",
      name: "submittedAtDesc",
      by: [{ field: "submittedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "name", subtitle: "email" },
  },
});
