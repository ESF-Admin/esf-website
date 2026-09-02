import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { story } from "@/lib/content";
import { Section } from "./section";

/** Homepage teaser — full timeline lives at /history. */
export function HistoryTeaser() {
  return (
    <Section id="history" eyebrow={story.tagline} title={story.title} tinted>
      <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
        {story.paragraphs[0]}
      </p>

      <div className="mt-8">
        <Link
          href="/history"
          className="group inline-flex cursor-pointer items-center gap-2 text-base font-semibold text-primary"
        >
          Read our full story
          <ArrowRight
            aria-hidden
            className="size-4 transition-transform duration-200 group-hover:translate-x-1"
          />
        </Link>
      </div>
    </Section>
  );
}
