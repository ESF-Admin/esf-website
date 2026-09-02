import Link from "next/link";
import { Eye, FileText } from "lucide-react";
import type { BulletinEntry, SermonEntry } from "@/lib/content";

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

type Props = {
  entry: BulletinEntry | SermonEntry;
  /** "/bulletins" or "/sermons" — where this entry's viewer route lives. */
  viewBasePath: string;
};

/**
 * One row of a weekly-document archive (bulletins, sermons) — shared by
 * each type's homepage teaser and full list. Download lives inside the
 * viewer page, not here, so there's exactly one Download control per entry.
 */
export function DocumentRow({ entry, viewBasePath }: Props) {
  const isUpcoming = !entry.scripture;
  const speaker = "speaker" in entry ? entry.speaker : undefined;

  return (
    <div className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center">
      <span
        aria-hidden
        className="grid size-12 shrink-0 place-items-center rounded-full bg-accent-soft text-accent"
      >
        <FileText className="size-5" strokeWidth={1.75} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold tracking-[0.12em] text-accent uppercase">
          {formatDate(entry.date)}
        </p>
        <h3 className="mt-1 text-lg font-semibold text-balance">
          {entry.title}
          {isUpcoming && (
            <span className="ml-2 align-middle text-xs font-medium text-muted-foreground">
              (upcoming)
            </span>
          )}
        </h3>
        {(entry.scripture || speaker) && (
          <p className="mt-1 text-sm text-muted-foreground">
            {[entry.scripture, speaker].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>

      {entry.fileUrl || entry.pdfUrl ? (
        <Link
          href={(() => {
            // Prefer the PDF — browsers render it natively and instantly.
            // No PDF yet: fall back to the slower Word-document viewer.
            const src = entry.pdfUrl ?? entry.fileUrl!;
            const params = new URLSearchParams({ src, title: entry.title });
            if (entry.pdfUrl) params.set("type", "pdf");
            return `${viewBasePath}/view?${params.toString()}`;
          })()}
          className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold transition-colors duration-200 hover:bg-surface-2"
        >
          <Eye aria-hidden className="size-4" />
          View
        </Link>
      ) : (
        <span
          aria-disabled="true"
          title="Document link coming soon"
          className="inline-flex shrink-0 cursor-not-allowed items-center gap-2 rounded-full border border-dashed border-border px-5 py-2.5 text-sm font-semibold text-muted-foreground"
        >
          <Eye aria-hidden className="size-4" />
          View
        </span>
      )}
    </div>
  );
}
