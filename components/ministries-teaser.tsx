import Link from "next/link";
import { ArrowRight, Church, HandHeart, BookOpenText, Baby } from "lucide-react";
import { ministries } from "@/lib/content";
import { Section } from "./section";
import { RevealGroup, RevealItem } from "./reveal";

const icons = [Church, HandHeart, BookOpenText, Baby];

/** Homepage teaser — full detail lives at /ministries. */
export function MinistriesTeaser() {
  return (
    <Section
      id="ministries"
      title={ministries.title}
      subtitle={ministries.subtitle}
      placeholder={ministries.placeholder}
    >
      <RevealGroup as="div" className="flex flex-wrap gap-3">
        {ministries.items.map((m, i) => {
          const Icon = icons[i];
          return (
            <RevealItem
              as="span"
              key={m.name}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-medium"
            >
              <Icon aria-hidden className="size-4 text-accent" strokeWidth={1.75} />
              {m.name}
            </RevealItem>
          );
        })}
      </RevealGroup>

      <div className="mt-8">
        <Link
          href="/ministries"
          className="group inline-flex cursor-pointer items-center gap-2 text-base font-semibold text-primary"
        >
          Explore ministries
          <ArrowRight
            aria-hidden
            className="size-4 transition-transform duration-200 group-hover:translate-x-1"
          />
        </Link>
      </div>
    </Section>
  );
}
