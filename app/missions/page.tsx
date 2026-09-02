import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Missions } from "@/components/missions";

export const metadata: Metadata = {
  title: "Missions",
  description: "Countries where ESF and its partners serve.",
};

export default function MissionsPage() {
  return (
    <>
      <Nav />
      <main id="main" className="pt-20">
        <Missions />
      </main>
      <Footer />
    </>
  );
}
