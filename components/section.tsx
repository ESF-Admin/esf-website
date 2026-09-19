import type { ReactNode } from "react";
import { Reveal } from "./reveal";

type Props = {
  id: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  /** Renders the section on the raised surface tone instead of page background. */
  tinted?: boolean;
  /** "h1" when this Section is a standalone page's only heading; "h2" (default) when nested under a page that already has its own h1 (e.g. a homepage teaser under Hero). */
  headingLevel?: "h1" | "h2";
};

export function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
  tinted,
  headingLevel = "h2",
}: Props) {
  const Heading = headingLevel;
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={`scroll-mt-24 py-20 sm:py-28 ${tinted ? "bg-surface-2" : ""} ${className}`}
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <Reveal className="mb-12 max-w-2xl sm:mb-16">
          {eyebrow && (
            <p className="mb-3 text-sm font-semibold tracking-[0.14em] text-accent uppercase">
              {eyebrow}
            </p>
          )}
          <Heading
            id={`${id}-heading`}
            className="text-3xl font-semibold text-balance sm:text-4xl md:text-[2.75rem]"
          >
            {title}
          </Heading>
          {subtitle && (
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-pretty">
              {subtitle}
            </p>
          )}
        </Reveal>
        {children}
      </div>
    </section>
  );
}
