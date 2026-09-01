import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { Story } from "@/components/story";
import { Mission } from "@/components/mission";
import { Bulletins } from "@/components/bulletins";
import { Ministries } from "@/components/ministries";
import { Missions } from "@/components/missions";
import { Sermons } from "@/components/sermons";
import { Testimonials } from "@/components/testimonials";
import { ContactSection } from "@/components/contact";
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
        <Bulletins />
        <Ministries />
        <Missions />
        <Sermons />
        <Story />
        <Mission />
        <Testimonials />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
