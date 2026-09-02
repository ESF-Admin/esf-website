import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Ministries } from "@/components/ministries";

export const metadata: Metadata = {
  title: "Ministries",
  description: "Ways to get plugged in at ESF — Adult, Evangelism, Bible Studies, and Youth & Children.",
};

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
