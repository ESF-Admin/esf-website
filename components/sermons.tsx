import { PlayCircle } from "lucide-react";
import { sermons } from "@/lib/content";
import { Section } from "./section";
import { RevealGroup, RevealItem } from "./reveal";

export function Sermons() {
  return (
    <Section
      id="sermon"
      title={sermons.title}
      subtitle={sermons.subtitle}
      placeholder={sermons.placeholder}
    >
      <RevealGroup as="ul" className="divide-y divide-border border-y border-border">
        {sermons.items.map((s) => (
          <RevealItem as="li" key={s.title}>
            <div className="flex items-start gap-5 py-7 sm:items-center">
              <span
                aria-hidden
                className="grid size-12 shrink-0 place-items-center rounded-full bg-accent-soft text-accent"
              >
                <PlayCircle className="size-6" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold tracking-[0.12em] text-accent uppercase">
                  {s.series}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-balance">
                  {s.title}
                </h3>
                <p className="mt-1.5 leading-relaxed text-muted-foreground text-pretty">
                  {s.body}
                </p>
              </div>
              <p className="hidden shrink-0 text-sm text-muted-foreground sm:block">
                {s.meta}
              </p>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
