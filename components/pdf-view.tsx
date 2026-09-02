"use client";

import { useEffect, useState } from "react";
import { PdfViewer } from "./pdf-viewer-lazy";

/**
 * Desktop browsers (Chrome/Edge/Firefox/Safari) ship an excellent native
 * PDF viewer — full-size, its own zoom/search/print controls, fits the
 * available space automatically. Using it beats any custom-rendered
 * viewer, which is exactly why the earlier canvas-based PdfViewer looked
 * cramped on a big monitor (capped to a fixed max width).
 *
 * Mobile is the one place a plain <iframe src={pdf}> doesn't work: iOS
 * Safari's native PDF handling inside a nested iframe only renders page 1
 * and never scrolls further (a real WebKit limitation, confirmed on a
 * real iPhone). PdfViewer (canvas-rendered via pdf.js) is kept for that
 * case only, where it's already proven to work well.
 */
export function PdfView({ src, title }: { src: string; title: string }) {
  // null until mounted — avoids a server/client mismatch, since "mobile"
  // can only be known once we're actually running in the browser.
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (isMobile === null) {
    return (
      <p className="mt-10 text-center text-muted-foreground">Loading…</p>
    );
  }

  if (isMobile) {
    return <PdfViewer src={src} title={title} />;
  }

  // #view=FitH is a standard PDF "open parameter" — tells the browser's
  // native viewer to fit the page to the container's width automatically.
  return (
    <iframe
      title={title}
      src={`${src}#view=FitH`}
      className="min-h-0 flex-1"
    />
  );
}
