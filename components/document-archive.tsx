import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { DocumentRow } from "@/components/document-row";
import { docLocales, type BulletinEntry, type DocLocale, type SermonEntry } from "@/lib/content";
import { DOCS_PER_PAGE } from "@/lib/sanity/queries";

type Props = {
  eyebrow: string;
  title: string;
  intro: string;
  /** "/bulletins" or "/sermons" — drives tab links and the row's view links. */
  basePath: string;
  /** e.g. "Bulletin language" — the tablist's accessible name. */
  tabsLabel: string;
  active: DocLocale;
  entries: (BulletinEntry | SermonEntry)[];
  /** Total entries across all pages, for computing page count. */
  total: number;
  /** Current 1-indexed page. */
  page: number;
  emptyText: string;
};

/** Full-page archive listing, shared by /bulletins and /sermons. */
export function DocumentArchive({
  eyebrow,
  title,
  intro,
  basePath,
  tabsLabel,
  active,
  entries,
  total,
  page,
  emptyText,
}: Props) {
  const pageCount = Math.max(1, Math.ceil(total / DOCS_PER_PAGE));
  const pageHref = (p: number) => `${basePath}?lang=${active}&page=${p}`;
  return (
    <>
      <Nav />
      <main id="main" className="pt-32 pb-24 sm:pt-40">
        <div className="mx-auto w-full max-w-4xl px-5 sm:px-8">
          <p className="text-sm font-semibold tracking-[0.14em] text-accent uppercase">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-balance sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
            {intro}
          </p>

          <div
            role="tablist"
            aria-label={tabsLabel}
            className="mt-8 inline-flex gap-1 rounded-full border border-border bg-surface p-1"
          >
            {docLocales.map(({ code, label }) => (
              <Link
                key={code}
                href={`${basePath}?lang=${code}`}
                role="tab"
                aria-selected={active === code}
                className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                  active === code
                    ? "bg-gradient-to-r from-primary to-accent text-on-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="mt-10">
            {entries.length > 0 ? (
              <div className="divide-y divide-border rounded-2xl border border-border bg-surface px-6">
                {entries.map((entry) => (
                  <DocumentRow key={entry.date} entry={entry} viewBasePath={basePath} />
                ))}
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-border bg-surface-2 px-6 py-10 text-center text-muted-foreground">
                {emptyText}
              </p>
            )}
          </div>

          {pageCount > 1 && (
            <nav
              aria-label="Pagination"
              className="mt-8 flex items-center justify-between gap-4"
            >
              {page > 1 ? (
                <Link
                  href={pageHref(page - 1)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold transition-colors duration-200 hover:bg-surface-2"
                >
                  <ChevronLeft aria-hidden className="size-4" />
                  Previous
                </Link>
              ) : (
                <span />
              )}
              <p className="text-sm text-muted-foreground">
                Page {page} of {pageCount}
              </p>
              {page < pageCount ? (
                <Link
                  href={pageHref(page + 1)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold transition-colors duration-200 hover:bg-surface-2"
                >
                  Next
                  <ChevronRight aria-hidden className="size-4" />
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
