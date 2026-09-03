import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Story } from "@/components/story";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "History",
  description: "How ESF began in Seoul, Korea in 1976, and how it came to Chicago.",
  path: "/history",
});

export default function HistoryPage() {
  return (
    <>
      <Nav />
      <main id="main" className="pt-20">
        <Story />
      </main>
      <Footer />
    </>
  );
}
