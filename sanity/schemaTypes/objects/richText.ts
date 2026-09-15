import { defineArrayMember, defineType } from "sanity";
import { hrefField } from "../shared";

/**
 * Deliberately constrained: normal text, one heading style, bullet lists,
 * bold/italic, and a link mark validated against the same href allowlist as
 * every other link field in the schema. No HTML block, no arbitrary markup —
 * nothing from Sanity may reach `dangerouslySetInnerHTML` anywhere in this
 * codebase, and the render-side Portable Text serializer re-validates the
 * href again (schema validation doesn't run against documents written via
 * the API or Vision).
 */
export const richText = defineType({
  name: "richText",
  title: "Rich text",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "Heading", value: "h3" },
      ],
      lists: [{ title: "Bullet", value: "bullet" }],
      marks: {
        decorators: [
          { title: "Bold", value: "strong" },
          { title: "Italic", value: "em" },
        ],
        annotations: [
          {
            name: "link",
            type: "object",
            title: "Link",
            fields: [hrefField()],
          },
        ],
      },
    }),
  ],
});
