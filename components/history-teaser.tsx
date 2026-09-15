import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { story } from "@/lib/content";
import { getPage } from "@/lib/sanity/queries";
import { Section } from "./section";

const FALLBACK = {
  eyebrow: story.tagline,
  title: story.title,
  paragraphs: [...story.paragraphs],
};

/** Homepage teaser — full timeline lives at /history, same CMS-backed data. */
export async function HistoryTeaser() {
  const data = await getPage("history", FALLBACK);

  return (
    <Section id="history" eyebrow={data.eyebrow} title={data.title} tinted>
      <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
        {data.paragraphs[0]}
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
