import {
  PortableText,
  type PortableTextComponents,
  type PortableTextBlock,
} from "@portabletext/react";

// Same pattern as sanity/schemaTypes/shared.ts's HREF_RE — deliberately
// duplicated, not imported: that file blocks `javascript:` at the schema
// level in Studio, but that validation never runs against a document
// written directly via the API or Vision, so this is the render-side
// re-check that actually keeps a bad href from reaching an <a> tag.
const HREF_RE = /^(https?:\/\/|mailto:|tel:|\/|#)/i;

/**
 * The only place a richText link annotation becomes an <a> tag. Always
 * wins over any custom `components.marks.link` a caller passes in (see
 * RichText below) — there is no way to opt out of this check.
 */
const safeLinkMark: PortableTextComponents["marks"] = {
  link: ({ value, children }) => {
    const href = typeof value?.href === "string" ? value.href : "";
    if (!HREF_RE.test(href)) return <>{children}</>;

    const isExternal = /^https?:/i.test(href);
    return (
      <a
        href={href}
        {...(isExternal && { target: "_blank", rel: "noopener noreferrer" })}
        className="underline decoration-1 underline-offset-2 transition-opacity hover:opacity-80"
      >
        {children}
      </a>
    );
  },
};

type Props = {
  value: PortableTextBlock[] | null | undefined;
  /** Block/list/mark renderers for this usage's own typography — merged under the hardened link mark, never able to override it. */
  components?: PortableTextComponents;
  className?: string;
};

export function RichText({ value, components, className }: Props) {
  if (!value?.length) return null;

  return (
    <div className={className}>
      <PortableText
        value={value}
        components={{
          ...components,
          marks: { ...components?.marks, ...safeLinkMark },
        }}
      />
    </div>
  );
}
