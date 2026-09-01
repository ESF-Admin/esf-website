import type { Metadata, Viewport } from "next";
import { Outfit, Work_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { org } from "@/lib/content";
import "./globals.css";

const heading = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const body = Work_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://esf.example.org";

// The legacy Wix site ships `noindex`. Indexing stays off until
// NEXT_PUBLIC_ALLOW_INDEXING=true is set for the production deploy.
const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";

const description =
  "Evangelical Student Fellowship is an international Christian student ministry on college and university campuses worldwide, and a multi-ethnic ministry in Chicago. Founded in Seoul, Korea in 1976.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${org.name} (ESF) — Campus Ministry`,
    template: `%s | ${org.shortName}`,
  },
  description,
  applicationName: org.name,
  keywords: [
    "campus ministry",
    "Christian student fellowship",
    "ESF",
    "Chicago",
    "Bible study",
    "college ministry",
  ],
  alternates: { canonical: "/" },
  robots: allowIndexing
    ? { index: true, follow: true }
    : { index: false, follow: false },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: org.name,
    title: `${org.name} (ESF) — Campus Ministry`,
    description,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${org.name} (ESF) — Campus Ministry`,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#14120f" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${heading.variable} ${body.variable} antialiased`}>
        <ThemeProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-5 focus:py-3 focus:font-semibold focus:text-on-primary"
          >
            Skip to main content
          </a>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
