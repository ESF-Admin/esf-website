import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { ContactSection } from "@/components/contact";
import { contact, pageSeoDefaults } from "@/lib/content";
import { getPage } from "@/lib/sanity/queries";
import { pageMetadata } from "@/lib/seo";

const FALLBACK = {
  title: contact.title,
  intro: contact.subtitle,
  seo: pageSeoDefaults.contact,
};

export async function generateMetadata(): Promise<Metadata> {
  const data = await getPage("contact", FALLBACK);
  return pageMetadata({
    title: data.seo.title,
    description: data.seo.description,
    path: "/contact",
  });
}

export default async function ContactPage() {
  const data = await getPage("contact", FALLBACK);

  return (
    <>
      <Nav />
      <main id="main" className="pt-20">
        <ContactSection title={data.title} subtitle={data.intro} />
      </main>
      <Footer />
    </>
  );
}
