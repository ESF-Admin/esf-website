import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Missions } from "@/components/missions";
import { missions, pageSeoDefaults } from "@/lib/content";
import { getPage, getMissionCountries } from "@/lib/sanity/queries";
import { pageMetadata } from "@/lib/seo";

const FALLBACK = {
  title: missions.title,
  intro: missions.subtitle,
  seo: pageSeoDefaults.missions,
};

export async function generateMetadata(): Promise<Metadata> {
  const data = await getPage("missions", FALLBACK);
  return pageMetadata({
    title: data.seo.title,
    description: data.seo.description,
    path: "/missions",
  });
}

export default async function MissionsPage() {
  const [data, countries] = await Promise.all([
    getPage("missions", FALLBACK),
    getMissionCountries(),
  ]);

  return (
    <>
      <Nav />
      <main id="main" className="pt-20">
        <Missions
          title={data.title}
          subtitle={data.intro}
          countries={countries}
        />
      </main>
      <Footer />
    </>
  );
}
