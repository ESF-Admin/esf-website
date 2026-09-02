import { story } from "@/lib/content";
import { Section } from "./section";
import { RevealGroup, RevealItem } from "./reveal";

export function Story() {
  return (
    <Section id="history" eyebrow={story.tagline} title={story.title} headingLevel="h1">
      <div className="grid gap-14 lg:grid-cols-[minmax(0,26rem)_1fr]">
        <div className="space-y-5">
          {story.paragraphs.map((p) => (
            <p
              key={p.slice(0, 24)}
              className="text-lg leading-relaxed text-muted-foreground text-pretty"
            >
              {p}
            </p>
          ))}
        </div>

        <RevealGroup as="div" className="relative">
          <span
            aria-hidden
            className="absolute top-2 bottom-2 left-[0.4375rem] w-px bg-border"
          />
          <ol className="space-y-10">
            {story.milestones.map((m) => (
              <RevealItem as="li" key={m.year} className="relative pl-10">
                <span
                  aria-hidden
                  className="absolute top-1.5 left-0 size-3.5 rounded-full border-2 border-accent bg-background"
                />
                <p className="font-display text-sm font-bold tracking-[0.12em] text-accent uppercase">
                  {m.year}
                </p>
                <h3 className="mt-1.5 text-xl font-semibold">{m.title}</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground text-pretty">
                  {m.body}
                </p>
              </RevealItem>
            ))}
          </ol>
        </RevealGroup>
      </div>
    </Section>
  );
}
