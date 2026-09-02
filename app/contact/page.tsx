import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { ContactSection } from "@/components/contact";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach ESF by phone, email, or the contact form.",
};

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
