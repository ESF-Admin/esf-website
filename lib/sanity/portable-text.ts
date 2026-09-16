import type { PortableTextBlock } from "@portabletext/react";

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
