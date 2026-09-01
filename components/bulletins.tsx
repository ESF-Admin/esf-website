import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { bulletins } from "@/lib/content";
import { getBulletins } from "@/lib/sanity/queries";
import { Section } from "./section";
import { RevealGroup, RevealItem } from "./reveal";
import { BulletinRow } from "./bulletin-row";

export async function Bulletins() {
  const latest = (await getBulletins("en")).slice(0, 3);

  return (
    <Section id="bulletins" title={bulletins.title} subtitle={bulletins.subtitle} tinted>
      {latest.length > 0 ? (
        <RevealGroup
          as="div"
          className="divide-y divide-border rounded-2xl border border-border bg-surface px-6"
        >
          {latest.map((entry) => (
            <RevealItem as="div" key={entry.date}>
              <BulletinRow entry={entry} />
            </RevealItem>
          ))}
        </RevealGroup>
      ) : (
        <p className="rounded-2xl border border-dashed border-border bg-surface-2 px-6 py-10 text-center text-muted-foreground">
          Bulletins will appear here once published.
        </p>
      )}

      <div className="mt-8">
        <Link
          href="/bulletins?lang=en"
          className="group inline-flex cursor-pointer items-center gap-2 text-base font-semibold text-primary"
        >
          View the full bulletin archive
          <ArrowRight
            aria-hidden
            className="size-4 transition-transform duration-200 group-hover:translate-x-1"
          />
        </Link>
      </div>
    </Section>
  );
}
