import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { LegalPage } from "@/components/legal-page";
import { privacyPolicy, pageSeoDefaults } from "@/lib/content";
import { getPage } from "@/lib/sanity/queries";
import { sectionsToBlocks } from "@/lib/sanity/portable-text";
import { pageMetadata } from "@/lib/seo";

const FALLBACK = {
  eyebrow: privacyPolicy.eyebrow,
  title: privacyPolicy.title,
  intro: privacyPolicy.intro,
  lastUpdated: privacyPolicy.lastUpdated,
  body: sectionsToBlocks(privacyPolicy.sections),
  seo: pageSeoDefaults.privacy,
};

export async function generateMetadata(): Promise<Metadata> {
  const data = await getPage("privacy", FALLBACK);
  return pageMetadata({
    title: data.seo.title,
    description: data.seo.description,
    path: "/privacy",
  });
}

export default async function PrivacyPage() {
  const data = await getPage("privacy", FALLBACK);

  return (
    <>
      <Nav />
      <main id="main" className="pt-20">
        <LegalPage slug="privacy" {...data} />
      </main>
      <Footer />
    </>
  );
}
