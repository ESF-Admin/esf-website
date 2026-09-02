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
import { mission, org } from "@/lib/content";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: org.name,
  alternateName: org.shortName,
  foundingDate: "1976",
  foundingLocation: "Seoul, Korea",
  description: mission.statement,
  email: org.email,
  telephone: org.phone,
  address: org.address,
  areaServed: "Chicago, Illinois and college campuses worldwide",
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
