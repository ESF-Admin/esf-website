import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Story } from "@/components/story";

export const metadata: Metadata = {
  title: "History",
  description: "How ESF began in Seoul, Korea in 1976, and how it came to Chicago.",
};

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
