import { defineField, defineType } from "sanity";

export const bulletin = defineType({
  name: "bulletin",
  title: "Bulletin",
  type: "document",
  fields: [
    defineField({
      name: "date",
      title: "Service date",
      type: "date",
      description: "The Sunday this bulletin is for. Controls sort order — newest date always shows first.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      title: "Message title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "scripture",
      title: "Scripture reference",
      type: "string",
      description: 'e.g. "John 6:25–35". Leave blank for an upcoming/not-yet-preached bulletin.',
    }),
    defineField({
      name: "locale",
      title: "Language",
      type: "string",
      options: {
        list: [
          { title: "English", value: "en" },
          { title: "Spanish", value: "es" },
          { title: "French", value: "fr" },
        ],
        layout: "radio",
      },
      initialValue: "en",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "file",
      title: "Bulletin file (Word document)",
      type: "file",
      options: {
        accept:
          ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      },
      description: "Upload the .docx bulletin. Leave empty until the file is ready — the site shows a disabled View button until then.",
    }),
    defineField({
      name: "pdf",
      title: "PDF version (recommended — makes View instant)",
      type: "file",
      options: { accept: ".pdf,application/pdf" },
      description:
        'Optional, but recommended: in Word, use "Save As" → "PDF" (or "Export → Create PDF/XPS") to save a PDF copy of the same bulletin, then upload it here too. Browsers open PDFs instantly with no extra step — without one, "View" falls back to a slower Word-document viewer.',
    }),
  ],
  preview: {
    select: { title: "title", date: "date", locale: "locale" },
    prepare({ title, date, locale }) {
      return { title, subtitle: [date, locale].filter(Boolean).join(" · ") };
    },
  },
  orderings: [
    {
      title: "Service date, newest first",
      name: "dateDesc",
      by: [{ field: "date", direction: "desc" }],
    },
  ],
});
