import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Story } from "@/components/story";
import { story, pageSeoDefaults } from "@/lib/content";
import { getPage } from "@/lib/sanity/queries";
import { pageMetadata } from "@/lib/seo";

const FALLBACK = {
  eyebrow: story.tagline,
  title: story.title,
  paragraphs: [...story.paragraphs],
  milestones: [...story.milestones],
  seo: pageSeoDefaults.history,
};

export async function generateMetadata(): Promise<Metadata> {
  const data = await getPage("history", FALLBACK);
  return pageMetadata({
    title: data.seo.title,
    description: data.seo.description,
    path: "/history",
  });
}

export default async function HistoryPage() {
  const data = await getPage("history", FALLBACK);

  return (
    <>
      <Nav />
      <main id="main" className="pt-20">
        <Story
          eyebrow={data.eyebrow}
          title={data.title}
          paragraphs={data.paragraphs}
          milestones={data.milestones}
        />
      </main>
      <Footer />
    </>
  );
}
