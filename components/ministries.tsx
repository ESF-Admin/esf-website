import { Church, HandHeart, BookOpenText, Baby } from "lucide-react";
import { ministries } from "@/lib/content";
import { Section } from "./section";
import { RevealGroup, RevealItem } from "./reveal";

const icons = [Church, HandHeart, BookOpenText, Baby];

export function Ministries() {
  return (
    <Section
      id="ministries"
      title={ministries.title}
      subtitle={ministries.subtitle}
      placeholder={ministries.placeholder}
      tinted
    >
      <RevealGroup as="div" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {ministries.items.map((m, i) => {
          const Icon = icons[i];
          return (
            <RevealItem
              as="article"
              key={m.name}
              className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-7 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
            >
              <span className="grid size-12 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-on-primary">
                <Icon aria-hidden className="size-6" strokeWidth={1.75} />
              </span>
              <h3 className="mt-5 text-lg font-semibold">{m.name}</h3>
              <p className="mt-2.5 flex-1 leading-relaxed text-muted-foreground text-pretty">
                {m.body}
              </p>
            </RevealItem>
          );
        })}
      </RevealGroup>
    </Section>
  );
}
