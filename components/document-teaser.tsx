import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { BulletinEntry, SermonEntry } from "@/lib/content";
import { Section } from "./section";
import { RevealGroup, RevealItem } from "./reveal";
import { DocumentRow } from "./document-row";

type Props = {
  id: string;
  title: string;
  subtitle: string;
  entries: (BulletinEntry | SermonEntry)[];
  /** "/bulletins" or "/sermons" */
  basePath: string;
  emptyText: string;
  archiveLinkText: string;
};

/** Homepage teaser (latest 3), shared by Bulletins and Sermons. */
export function DocumentTeaser({
  id,
  title,
  subtitle,
  entries,
  basePath,
  emptyText,
  archiveLinkText,
}: Props) {
  return (
    <Section id={id} title={title} subtitle={subtitle} tinted>
      {entries.length > 0 ? (
        <RevealGroup
          as="div"
          className="divide-y divide-border rounded-2xl border border-border bg-surface px-6"
        >
          {entries.map((entry) => (
            <RevealItem as="div" key={entry.date}>
              <DocumentRow entry={entry} viewBasePath={basePath} />
            </RevealItem>
          ))}
        </RevealGroup>
      ) : (
        <p className="rounded-2xl border border-dashed border-border bg-surface-2 px-6 py-10 text-center text-muted-foreground">
          {emptyText}
        </p>
      )}

      <div className="mt-8">
        <Link
          href={`${basePath}?lang=en`}
          className="group inline-flex cursor-pointer items-center gap-2 text-base font-semibold text-primary"
        >
          {archiveLinkText}
          <ArrowRight
            aria-hidden
            className="size-4 transition-transform duration-200 group-hover:translate-x-1"
          />
        </Link>
      </div>
    </Section>
  );
}
