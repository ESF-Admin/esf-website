import type { ReactNode } from "react";
import type { PortableTextBlock } from "@portabletext/react";
import { RichText } from "./rich-text";
import { Section } from "./section";

type Children = { children?: ReactNode };

// The Studio "Heading" style is h3, but under this page's h1 it is the
// next level down, so it renders as <h2>.
const legalComponents = {
  block: {
    h3: ({ children }: Children) => (
      <h2 className="mt-12 mb-4 text-xl font-semibold text-foreground first:mt-0 sm:text-2xl">
        {children}
      </h2>
    ),
    normal: ({ children }: Children) => <p className="mt-4">{children}</p>,
  },
  list: {
    bullet: ({ children }: Children) => (
      <ul className="mt-4 list-disc space-y-2 pl-6 marker:text-accent">{children}</ul>
    ),
  },
};

type Props = {
  slug: "privacy" | "terms";
  eyebrow: string;
  title: string;
  intro: string;
  lastUpdated: string;
  body: PortableTextBlock[];
};

export function LegalPage({ slug, eyebrow, title, intro, lastUpdated, body }: Props) {
  // A plain "YYYY-MM-DD" parses as UTC midnight; format in UTC so it never
  // shows the previous day in US time zones.
  const updated = new Date(lastUpdated).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  return (
    <Section id={slug} eyebrow={eyebrow} title={title} subtitle={intro} headingLevel="h1">
      <div className="max-w-3xl">
        <p className="text-sm text-muted-foreground">
          Last updated: <time dateTime={lastUpdated}>{updated}</time>
        </p>
        <RichText
          value={body}
          components={legalComponents}
          className="mt-10 leading-relaxed text-muted-foreground text-pretty [&_a]:text-foreground [&_a]:hover:text-accent"
        />
      </div>
    </Section>
  );
}
