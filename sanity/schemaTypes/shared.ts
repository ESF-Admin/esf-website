import { defineField } from "sanity";
import { apiVersion } from "../env";

/**
 * Allowed href shapes across the whole site: an internal path, an in-page
 * anchor, or an external http(s)/mailto/tel link. Deliberately excludes
 * `javascript:` and any other scheme — this is the one thing standing
 * between "admin edits a link" and stored XSS, so every href field in the
 * schema (CTAs, nav items, rich-text link marks) routes
 * through this pattern, and the render layer re-checks it again (schema
 * validation only runs in Studio, not against documents written via the
 * API/Vision).
 */
export const HREF_RE = /^(https?:\/\/|mailto:|tel:|\/|#)/i;

export function hrefField(name = "href", title = "Link") {
  return defineField({
    name,
    title,
    type: "string",
    description:
      'Where this goes. Use a path like "/contact" for a page on this site, or a full address starting with https:// for another site.',
    validation: (rule) =>
      rule.required().custom((value) =>
        typeof value === "string" && HREF_RE.test(value)
          ? true
          : 'Must start with "/", "#", "https://", "mailto:" or "tel:".',
      ),
  });
}

/**
 * Manual sort order for a repeatable document type (ministry, testimonial,
 * missionCountry, ...) shown in a plain list, not a drag-orderable one —
 * simple, and fine at the handful-of-items scale these lists actually run
 * at. Seed scripts space values by 10 (10, 20, 30, ...) so a later
 * insertion doesn't require renumbering everything after it.
 */
export function orderField() {
  return defineField({
    name: "order",
    title: "Order",
    type: "number",
    description: "Lower numbers show first. Leave gaps (10, 20, 30) so you can insert one later.",
    validation: (rule) => rule.required().integer(),
  });
}

/** Field groups shared by every page-like document, so the Studio sidebar reads the same way everywhere. */
export const contentGroups = [
  { name: "content", title: "Content", default: true },
  { name: "media", title: "Images & video" },
  { name: "seo", title: "Search & sharing" },
] as const;

/** The three languages bulletins/sermons are published in — shared by the `locale` field's options and by the Studio structure's per-language sublists. */
export const DOC_LOCALES = [
  { title: "English", value: "en" },
  { title: "Spanish", value: "es" },
  { title: "French", value: "fr" },
] as const;

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
      name: "locale",
      title: "Language",
      type: "string",
      options: {
        list: [...DOC_LOCALES],
        layout: "radio",
      },
      initialValue: "en",
      validation: (rule) => rule.required(),
    }),
  ];
}

/** Sermon-only: the message title (bulletins are identified by date alone). */
export function titleField() {
  return defineField({
    name: "title",
    title: "Message title",
    type: "string",
    validation: (rule) => rule.required(),
  });
}

/** Sermon-only: the passage preached from. */
export function scriptureField() {
  return defineField({
    name: "scripture",
    title: "Scripture reference",
    type: "string",
    description: 'e.g. "John 6:25–35". Leave blank for an upcoming/not-yet-preached sermon.',
  });
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

/**
 * Same dereference-and-check idiom as fileTypeValidator(), for a max file
 * size in bytes. Sanity's file/image types have no built-in size rule —
 * this exists specifically for the hero background video, which autoplays
 * for every visitor and needs a hard ceiling, not just an advisory
 * description an admin might not read.
 */
export function fileSizeValidator(maxBytes: number) {
  return async (file: FileFieldValue, context: { getClient: (options: { apiVersion: string }) => { fetch: <T>(query: string, params?: Record<string, unknown>) => Promise<T> } }) => {
    const assetId = file?.asset?._ref;
    if (!assetId) return true;

    const client = context.getClient({ apiVersion });
    const asset = await client.fetch<{ size?: number } | null>(
      `*[_id == $id][0]{size}`,
      { id: assetId },
    );
    if (!asset?.size) return true; // asset still propagating — don't block on a race

    const maxMB = Math.round(maxBytes / 1_000_000);
    const gotMB = (asset.size / 1_000_000).toFixed(1);
    return asset.size <= maxBytes
      ? true
      : `File is ${gotMB}MB — please compress it to ${maxMB}MB or smaller.`;
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

/**
 * Eyebrow + title + intro + SEO — the shape every simple content page
 * shares (ministries, missions, history, contact, bulletins, sermons).
 * Callers spread this into their own `fields` array alongside anything
 * page-specific (e.g. history's milestones).
 */
export function pageCopyFields() {
  return [
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      description: "Small label above the page title, e.g. \"Get Involved\".",
      group: "content",
      validation: (rule) => rule.max(60),
    }),
    defineField({
      name: "title",
      title: "Page title",
      type: "string",
      group: "content",
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: "intro",
      title: "Intro text",
      type: "text",
      description: "A sentence or two under the title.",
      group: "content",
      validation: (rule) => rule.max(320),
    }),
    defineField({
      name: "seo",
      title: "Search & sharing",
      type: "seo",
      group: "seo",
    }),
  ];
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
        title: title ?? date ?? "Untitled",
        subtitle: [date, locale].filter(Boolean).join(" · "),
      };
    },
  };
}
