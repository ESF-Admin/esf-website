import { Section } from "./section";
import { RevealGroup, RevealItem } from "./reveal";
import { iconFor } from "@/lib/icon-map";

type Props = {
  title: string;
  subtitle: string;
  placeholder: boolean;
  items: { name: string; body: string; icon: string }[];
};

export function Ministries({ title, subtitle, placeholder, items }: Props) {
  return (
    <Section
      id="ministries"
      title={title}
      subtitle={subtitle}
      placeholder={placeholder}
      headingLevel="h1"
      tinted
    >
      <RevealGroup as="div" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((m) => {
          const Icon = iconFor(m.icon);
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
