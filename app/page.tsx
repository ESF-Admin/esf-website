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
import { siteUrl } from "@/lib/seo";

export const metadata = { alternates: { canonical: "/" } };

/** "6050 W Touhy Ave, Chicago, IL 60646" → schema.org PostalAddress; any other shape stays a plain string. */
function postalAddress(address: string) {
  const m = address.match(/^(.+),\s*([^,]+),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/);
  return m
    ? {
        "@type": "PostalAddress",
        streetAddress: m[1],
        addressLocality: m[2],
        addressRegion: m[3],
        postalCode: m[4],
        addressCountry: "US",
      }
    : address;
}

export default async function Home() {
  const [{ org }, { mission }] = await Promise.all([
    getSiteSettings(),
    getHomePage(),
  ]);

  // WebSite tells search engines the site's name (and "ESF" as an alternate)
  // for the name shown above results; the Organization/Church node carries
  // the details for knowledge panels and local results.
  const orgId = `${siteUrl}/#organization`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: `${siteUrl}/`,
        name: org.name,
        alternateName: [org.shortName, `${org.shortName} Chicago`],
        inLanguage: "en-US",
        publisher: { "@id": orgId },
      },
      {
        "@type": ["Organization", "Church"],
        "@id": orgId,
        name: org.name,
        alternateName: org.shortName,
        url: `${siteUrl}/`,
        logo: `${siteUrl}/icon.svg`,
        image: `${siteUrl}/opengraph-image`,
        foundingDate: "1976",
        foundingLocation: { "@type": "Place", name: "Seoul, South Korea" },
        // mission.statement is rich text; schema.org wants a plain string.
        description: blocksToPlainText(mission.statement),
        email: org.email,
        telephone: org.phone,
        address: postalAddress(org.address),
        hasMap: org.mapUrl,
        areaServed: "Chicago, Illinois and college campuses worldwide",
      },
    ],
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
