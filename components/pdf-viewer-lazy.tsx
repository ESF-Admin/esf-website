"use client";

import dynamic from "next/dynamic";

// pdf.js touches browser-only APIs (Worker, DOMMatrix, Canvas) at module
// load time, so it must never be evaluated during SSR. `ssr: false` is only
// allowed inside a Client Component — this file exists purely to be that
// boundary, so the Server Component document-viewer.tsx can still import it
// like a normal component.
export const PdfViewer = dynamic(
  () => import("@/components/pdf-viewer").then((m) => m.PdfViewer),
  {
    ssr: false,
    loading: () => (
      <p className="mt-10 text-center text-muted-foreground">Loading…</p>
    ),
  },
);
