import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { BulletinRow } from "@/components/bulletin-row";
import { bulletinLocales, type BulletinLocale } from "@/lib/content";
import { getBulletins } from "@/lib/sanity/queries";

export const metadata: Metadata = {
  title: "Bulletins",
  description:
    "The full archive of ESF Sunday service bulletins, most recent first.",
};

function isLocale(value: string | undefined): value is BulletinLocale {
  return bulletinLocales.some((l) => l.code === value);
}

export default async function BulletinsPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const active: BulletinLocale = isLocale(lang) ? lang : "en";
  const entries = await getBulletins(active);

  return (
    <>
      <Nav />
      <main id="main" className="pt-32 pb-24 sm:pt-40">
        <div className="mx-auto w-full max-w-4xl px-5 sm:px-8">
          <p className="text-sm font-semibold tracking-[0.14em] text-accent uppercase">
            Bulletin archive
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-balance sm:text-5xl">
            Bulletins
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
            Every Sunday service bulletin, most recent first.
          </p>

          <div
            role="tablist"
            aria-label="Bulletin language"
            className="mt-8 inline-flex gap-1 rounded-full border border-border bg-surface p-1"
          >
            {bulletinLocales.map(({ code, label }) => (
              <Link
                key={code}
                href={`/bulletins?lang=${code}`}
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
                  <BulletinRow key={entry.date} entry={entry} />
                ))}
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-border bg-surface-2 px-6 py-10 text-center text-muted-foreground">
                No bulletins have been published in this language yet.
              </p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
