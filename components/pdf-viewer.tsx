"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

// Next's bundler resolves this to a hashed static asset matching the exact
// pdfjs-dist version react-pdf ships, so it can never drift out of sync.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

/**
 * Renders every page of a PDF to its own <canvas> via pdf.js, instead of
 * embedding the file in an <iframe>. iOS Safari's native PDF handling only
 * renders page 1 and doesn't scroll when a PDF is loaded into a nested
 * iframe — a real WebKit limitation, not fixable with CSS. Canvas-rendered
 * pages are plain DOM content, so they scroll normally on every platform.
 */
export function PdfViewer({ src, title }: { src: string; title: string }) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [error, setError] = useState(false);
  const [width, setWidth] = useState<number>();

  return (
    <div
      className="mx-auto flex min-h-0 flex-1 flex-col items-center gap-4 overflow-y-auto bg-surface-2 px-4 py-6"
      ref={(el) => {
        if (el && !width) setWidth(Math.min(el.clientWidth - 32, 800));
      }}
    >
      {error && (
        <p className="mt-10 text-center text-muted-foreground">
          This document couldn&apos;t be displayed. Try Download instead.
        </p>
      )}
      <Document
        file={src}
        onLoadSuccess={({ numPages: n }) => setNumPages(n)}
        onLoadError={() => setError(true)}
        loading={
          <p className="mt-10 text-center text-muted-foreground">
            Loading {title}…
          </p>
        }
        className="flex flex-col items-center gap-4"
      >
        {Array.from({ length: numPages ?? 0 }, (_, i) => (
          <Page
            key={i}
            pageNumber={i + 1}
            width={width}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="overflow-hidden rounded-lg shadow-md"
          />
        ))}
      </Document>
    </div>
  );
}
