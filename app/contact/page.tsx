import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { ContactSection } from "@/components/contact";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: "Reach ESF by phone, email, or the contact form.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <Nav />
      <main id="main" className="pt-20">
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
