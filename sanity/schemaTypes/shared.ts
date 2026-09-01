import { defineField } from "sanity";

/** Fields common to both weekly document types (bulletin, sermon). */
export function weeklyDocumentFields(kind: "bulletin" | "sermon") {
  return [
    defineField({
      name: "date",
      title: "Service date",
      type: "date",
      description: `The Sunday this ${kind} is for. Controls sort order — newest date always shows first.`,
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
      description: `e.g. "John 6:25–35". Leave blank for an upcoming/not-yet-preached ${kind}.`,
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
  ];
}

export function pdfField() {
  return defineField({
    name: "pdf",
    title: "PDF version (recommended — makes View instant)",
    type: "file",
    options: { accept: ".pdf,application/pdf" },
    description:
      'Optional, but recommended: in Word, use "Save As" → "PDF" (or "Export → Create PDF/XPS") to save a PDF copy of the same document, then upload it here too. Browsers open PDFs instantly with no extra step — without one, "View" falls back to a slower Word-document viewer.',
  });
}

export const weeklyDocumentOrderings = [
  {
    title: "Service date, newest first",
    name: "dateDesc",
    by: [{ field: "date", direction: "desc" as const }],
  },
];

export function weeklyDocumentPreview() {
  return {
    select: { title: "title", date: "date", locale: "locale" },
    prepare(value: Record<string, unknown>) {
      const { title, date, locale } = value as {
        title?: string;
        date?: string;
        locale?: string;
      };
      return {
        title: title ?? "Untitled",
        subtitle: [date, locale].filter(Boolean).join(" · "),
      };
    },
  };
}
