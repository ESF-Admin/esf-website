import { Globe2 } from "lucide-react";
import { missions } from "@/lib/content";
import { Section } from "./section";
import { RevealGroup, RevealItem } from "./reveal";

export function Missions() {
  return (
    <Section
      id="missions"
      title={missions.title}
      subtitle={missions.subtitle}
      placeholder={missions.placeholder}
    >
      <RevealGroup
        as="ul"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
      >
        {missions.countries.map((country) => (
          <RevealItem
            as="li"
            key={country}
            className="flex items-center gap-2.5 rounded-xl border border-border bg-surface px-4 py-3.5 transition-colors duration-200 hover:border-accent/60 hover:bg-accent-soft"
          >
            <Globe2 aria-hidden className="size-4 shrink-0 text-accent" />
            <span className="font-medium text-balance">{country}</span>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
