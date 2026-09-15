import { getHomePage } from "@/lib/sanity/queries";
import { HeroClient } from "./hero-client";

/** Server wrapper — fetches CMS-driven hero copy, hands off to the client component for motion. */
export async function Hero() {
  const { hero } = await getHomePage();

  return (
    <HeroClient
      eyebrow={hero.eyebrow}
      title={hero.title}
      body={hero.body}
      primaryCta={hero.primaryCta}
      secondaryCta={hero.secondaryCta}
    />
  );
}
