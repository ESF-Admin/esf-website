import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { LegalPage } from "@/components/legal-page";
import { termsOfUse, pageSeoDefaults } from "@/lib/content";
import { getPage } from "@/lib/sanity/queries";
import { sectionsToBlocks } from "@/lib/sanity/portable-text";
import { pageMetadata } from "@/lib/seo";

const FALLBACK = {
  eyebrow: termsOfUse.eyebrow,
  title: termsOfUse.title,
  intro: termsOfUse.intro,
  lastUpdated: termsOfUse.lastUpdated,
  body: sectionsToBlocks(termsOfUse.sections),
  seo: pageSeoDefaults.terms,
};

export async function generateMetadata(): Promise<Metadata> {
  const data = await getPage("terms", FALLBACK);
  return pageMetadata({
    title: data.seo.title,
    description: data.seo.description,
    path: "/terms",
  });
}

export default async function TermsPage() {
  const data = await getPage("terms", FALLBACK);

  return (
    <>
      <Nav />
      <main id="main" className="pt-20">
        <LegalPage slug="terms" {...data} />
      </main>
      <Footer />
    </>
  );
}
