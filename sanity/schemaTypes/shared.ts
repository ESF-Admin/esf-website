import { defineField } from "sanity";
import { apiVersion } from "../env";

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

type FileFieldValue = { asset?: { _ref?: string } } | undefined;

/**
 * Client-side `accept` filters only affect the OS file picker dialog — they
 * do nothing for drag-and-drop, and nothing stops "All Files" + picking
 * anything anyway. Real enforcement needs to look at what was actually
 * uploaded: dereference the asset and check its real mimeType/filename.
 * This runs in Studio and blocks Publish (via a normal validation error)
 * when the file doesn't match, without touching already-published documents
 * (validation only runs against edits made in Studio going forward).
 *
 * Returns the async validator function itself (not wrapped in a
 * `(rule) => rule.custom(...)` callback) — pass it to `rule.custom(...)`
 * inline at each field definition, so Sanity's own generics correctly
 * infer `FileRule` there instead of a wrapper fighting that inference.
 */
export function fileTypeValidator(
  label: string,
  mimeTypes: string[],
  extensions: string[],
) {
  return async (file: FileFieldValue, context: { getClient: (options: { apiVersion: string }) => { fetch: <T>(query: string, params?: Record<string, unknown>) => Promise<T> } }) => {
    const assetId = file?.asset?._ref;
    if (!assetId) return true; // field is optional — nothing uploaded is fine

    const client = context.getClient({ apiVersion });
    const asset = await client.fetch<{
      mimeType?: string;
      originalFilename?: string;
    } | null>(`*[_id == $id][0]{mimeType, originalFilename}`, {
      id: assetId,
    });
    if (!asset) return true; // asset still propagating — don't block on a race

    const ext = asset.originalFilename?.split(".").pop()?.toLowerCase();
    const mimeOk = !!asset.mimeType && mimeTypes.includes(asset.mimeType);
    const extOk = !!ext && extensions.includes(ext);

    // Either signal matching is enough — some browsers report a generic
    // mimeType (e.g. application/octet-stream) for legitimate files, so
    // requiring both would produce false rejections. A genuinely wrong
    // file fails both checks in practice.
    return mimeOk || extOk ? true : `Only ${label} files are allowed here.`;
  };
}

export const WORD_MIME_TYPES = [
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
export const WORD_EXTENSIONS = ["doc", "docx"];

export function pdfField() {
  return defineField({
    name: "pdf",
    title: "PDF version (recommended — makes View instant)",
    type: "file",
    options: { accept: ".pdf,application/pdf" },
    description:
      'Optional, but recommended: in Word, use "Save As" → "PDF" (or "Export → Create PDF/XPS") to save a PDF copy of the same document, then upload it here too. Browsers open PDFs instantly with no extra step — without one, "View" falls back to a slower Word-document viewer.',
    validation: (rule) =>
      rule.custom(fileTypeValidator("PDF (.pdf)", ["application/pdf"], ["pdf"])),
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
