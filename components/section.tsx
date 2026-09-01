import type { ReactNode } from "react";
import { Reveal } from "./reveal";

export function PlaceholderBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-accent/60 bg-accent-soft px-3 py-1 text-xs font-semibold tracking-wide text-accent uppercase">
      <span aria-hidden className="size-1.5 rounded-full bg-accent" />
      Placeholder content
    </span>
  );
}

type Props = {
  id: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** Shows the "Placeholder content" badge above the heading. */
  placeholder?: boolean;
  children: ReactNode;
  className?: string;
  /** Renders the section on the raised surface tone instead of page background. */
  tinted?: boolean;
};

export function Section({
  id,
  eyebrow,
  title,
  subtitle,
  placeholder,
  children,
  className = "",
  tinted,
}: Props) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={`scroll-mt-24 py-20 sm:py-28 ${tinted ? "bg-surface-2" : ""} ${className}`}
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <Reveal className="mb-12 max-w-2xl sm:mb-16">
          {placeholder && (
            <div className="mb-4">
              <PlaceholderBadge />
            </div>
          )}
          {eyebrow && (
            <p className="mb-3 text-sm font-semibold tracking-[0.14em] text-accent uppercase">
              {eyebrow}
            </p>
          )}
          <h2
            id={`${id}-heading`}
            className="text-3xl font-semibold text-balance sm:text-4xl md:text-[2.75rem]"
          >
            {title}
          </h2>
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
