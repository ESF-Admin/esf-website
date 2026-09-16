import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { SundayService } from "@/components/sunday-service";
import { Mission } from "@/components/mission";
import { Bulletins } from "@/components/bulletins";
import { MinistriesTeaser } from "@/components/ministries-teaser";
import { MissionsTeaser } from "@/components/missions-teaser";
import { Sermons } from "@/components/sermons";
import { HistoryTeaser } from "@/components/history-teaser";
import { Testimonials } from "@/components/testimonials";
import { ContactCta } from "@/components/contact-cta";
import { Footer } from "@/components/footer";
import { getSiteSettings, getHomePage } from "@/lib/sanity/queries";
import { blocksToPlainText } from "@/lib/sanity/portable-text";

export default async function Home() {
  const [{ org }, { mission }] = await Promise.all([
    getSiteSettings(),
    getHomePage(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: org.name,
    alternateName: org.shortName,
    foundingDate: "1976",
    foundingLocation: "Seoul, Korea",
    // mission.statement is rich text (Phase 5) — schema.org's `description`
    // must be a plain string, not a dumped Portable Text block array.
    description: blocksToPlainText(mission.statement),
    email: org.email,
    telephone: org.phone,
    address: org.address,
    areaServed: "Chicago, Illinois and college campuses worldwide",
  };

  return (
    <>
      <script
        type="application/ld+json"
        // JSON.stringify doesn't escape "</script>" — org data now comes
        // from the CMS, so a value containing that sequence would otherwise
        // break out of this script tag. < is JSON-safe and renders
        // identically once parsed.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Nav />
      <main id="main">
        <Hero />
        <SundayService />
        <Bulletins />
        <MinistriesTeaser />
        <MissionsTeaser />
        <Sermons />
        <HistoryTeaser />
        <Mission />
        <Testimonials />
        <ContactCta />
      </main>
      <Footer />
    </>
  );
}
