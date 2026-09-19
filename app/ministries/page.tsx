import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Ministries } from "@/components/ministries";
import { ministries, pageSeoDefaults } from "@/lib/content";
import { getPage, getMinistries } from "@/lib/sanity/queries";
import { pageMetadata } from "@/lib/seo";

const FALLBACK = {
  title: ministries.title,
  intro: ministries.subtitle,
  seo: pageSeoDefaults.ministries,
};

export async function generateMetadata(): Promise<Metadata> {
  const data = await getPage("ministries", FALLBACK);
  return pageMetadata({
    title: data.seo.title,
    description: data.seo.description,
    path: "/ministries",
  });
}

export default async function MinistriesPage() {
  const [data, items] = await Promise.all([
    getPage("ministries", FALLBACK),
    getMinistries(),
  ]);

  return (
    <>
      <Nav />
      <main id="main" className="pt-20">
        <Ministries
          title={data.title}
          subtitle={data.intro}
          items={items}
        />
      </main>
      <Footer />
    </>
  );
}
