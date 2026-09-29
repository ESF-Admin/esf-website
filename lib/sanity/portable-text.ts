import type { PortableTextBlock } from "@portabletext/react";
import type { LegalSection } from "../content";

const LINK_RE = /\[([^\]]+)\]\(([^)\s]+)\)/g;

/** One block from a string, turning each `[label](href)` into a link mark. */
function textBlock(key: string, text: string, style: string, listItem?: "bullet"): PortableTextBlock {
  const markDefs: { _type: "link"; _key: string; href: string }[] = [];
  const children: { _type: "span"; _key: string; text: string; marks: string[] }[] = [];
  const span = (value: string, marks: string[] = []) =>
    children.push({ _type: "span", _key: `${key}s${children.length}`, text: value, marks });

  let last = 0;
  for (const match of text.matchAll(LINK_RE)) {
    if (match.index > last) span(text.slice(last, match.index));
    const markKey = `${key}l${markDefs.length}`;
    markDefs.push({ _type: "link", _key: markKey, href: match[2] });
    span(match[1], [markKey]);
    last = match.index + match[0].length;
  }
  if (last < text.length || children.length === 0) span(text.slice(last));

  return {
    _type: "block",
    _key: key,
    style,
    markDefs,
    children,
    ...(listItem && { listItem, level: 1 }),
  };
}

/**
 * Legal page sections (lib/content.ts) → the richText shape Studio edits:
 * an "h3" block per heading, "normal" blocks for paragraphs, bullet blocks
 * for lists. Keys are stable, so re-running the seed produces the same doc.
 */
export function sectionsToBlocks(sections: LegalSection[]): PortableTextBlock[] {
  return sections.flatMap((section, i) => [
    textBlock(`h${i}`, section.heading, "h3"),
    ...section.body.flatMap((item, j) =>
      typeof item === "string"
        ? [textBlock(`p${i}-${j}`, item, "normal")]
        : item.map((text, k) => textBlock(`b${i}-${j}-${k}`, text, "normal", "bullet")),
    ),
  ]);
}

/**
 * Wraps a plain string into a single-paragraph Portable Text block —
 * used only to build the *fallback* value for a richText field, so
 * lib/content.ts can keep defaults as plain strings (simple, CMS-agnostic)
 * while the query layer still returns the same block-array shape the CMS
 * value would have, letting components/rich-text.tsx render either
 * uniformly.
 */
/**
 * The inverse of plainTextToBlocks() — flattens a rich-text value back to a
 * plain string, for the handful of places that need text, not markup (e.g.
 * a JSON-LD `description`, which must be a string per schema.org, not a
 * dumped block array).
 */
export function blocksToPlainText(blocks: PortableTextBlock[] | null | undefined): string {
  if (!blocks?.length) return "";
  return blocks
    .map((block) =>
      Array.isArray(block.children)
        ? block.children.map((child) => ("text" in child ? child.text : "")).join("")
        : "",
    )
    .join("\n\n");
}

export function plainTextToBlocks(text: string): PortableTextBlock[] {
  return [
    {
      _type: "block",
      _key: "fallback",
      style: "normal",
      markDefs: [],
      children: [{ _type: "span", _key: "fallback-span", text, marks: [] }],
    },
  ];
}
