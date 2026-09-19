import Link from "next/link";
import { ArrowRight, Globe2 } from "lucide-react";
import { missions } from "@/lib/content";
import { getPage, getMissionCountries } from "@/lib/sanity/queries";
import { Section } from "./section";
import { RevealGroup, RevealItem } from "./reveal";

const FALLBACK = {
  title: missions.title,
  intro: missions.subtitle,
};

/** Homepage teaser — full detail lives at /missions, same CMS-backed data. */
export async function MissionsTeaser() {
  const [data, countries] = await Promise.all([
    getPage("missions", FALLBACK),
    getMissionCountries(),
  ]);

  return (
    <Section
      id="missions"
      title={data.title}
      subtitle={data.intro}
      tinted
    >
      <RevealGroup as="div" className="flex flex-wrap gap-3">
        {countries.map((country) => (
          <RevealItem
            as="span"
            key={country}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-medium"
          >
            <Globe2 aria-hidden className="size-4 text-accent" />
            {country}
          </RevealItem>
        ))}
      </RevealGroup>

      <div className="mt-8">
        <Link
          href="/missions"
          className="group inline-flex cursor-pointer items-center gap-2 text-base font-semibold text-primary"
        >
          See where we serve
          <ArrowRight
            aria-hidden
            className="size-4 transition-transform duration-200 group-hover:translate-x-1"
          />
        </Link>
      </div>
    </Section>
  );
}
