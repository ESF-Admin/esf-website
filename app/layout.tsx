import type { Metadata, Viewport } from "next";
import { Outfit, Work_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import { getSiteSettings } from "@/lib/sanity/queries";
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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://esfworld.us";

// The legacy Wix site ships `noindex`. Indexing stays off until
// NEXT_PUBLIC_ALLOW_INDEXING=true is set for the production deploy.
const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";

export async function generateMetadata(): Promise<Metadata> {
  const { org, defaultSeo } = await getSiteSettings();
  const { title, description } = defaultSeo;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
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
      title,
      description,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

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
        <Analytics />
      </body>
    </html>
  );
}
