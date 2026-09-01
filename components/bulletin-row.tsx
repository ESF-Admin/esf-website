import Link from "next/link";
import { Download, Eye, FileText } from "lucide-react";
import type { BulletinEntry } from "@/lib/content";

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** One row of the bulletin archive — shared by the homepage teaser and the full list. */
export function BulletinRow({ entry }: { entry: BulletinEntry }) {
  const isUpcoming = !entry.scripture;

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
        {entry.scripture && (
          <p className="mt-1 text-sm text-muted-foreground">{entry.scripture}</p>
        )}
      </div>

      {entry.fileUrl ? (
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={`/bulletins/view?src=${encodeURIComponent(entry.fileUrl)}&title=${encodeURIComponent(entry.title)}`}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold transition-colors duration-200 hover:bg-surface-2"
          >
            <Eye aria-hidden className="size-4" />
            View
          </Link>
          <a
            href={entry.fileUrl}
            download
            aria-label={`Download ${entry.title}`}
            title="Download"
            className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border border-border bg-surface transition-colors duration-200 hover:bg-surface-2"
          >
            <Download aria-hidden className="size-4" />
          </a>
        </div>
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
