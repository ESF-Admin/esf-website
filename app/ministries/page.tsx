import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Ministries } from "@/components/ministries";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Ministries",
  description: "Ways to get plugged in at ESF — Young Adults, Evangelism, Bible Studies, and Youth & Children.",
  path: "/ministries",
});

export default function MinistriesPage() {
  return (
    <>
      <Nav />
      <main id="main" className="pt-20">
        <Ministries />
      </main>
      <Footer />
    </>
  );
}
