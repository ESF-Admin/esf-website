import { getHomePage } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import { HeroClient } from "./hero-client";

/** Server wrapper — fetches CMS-driven hero copy (and an optional background video), hands off to the client component for motion. */
export async function Hero() {
  const { hero, heroVideo } = await getHomePage();

  const posterUrl = heroVideo
    ? urlFor(heroVideo.poster)?.width(1920).fit("max").auto("format").url()
    : undefined;

  return (
    <HeroClient
      eyebrow={hero.eyebrow}
      title={hero.title}
      body={hero.body}
      primaryCta={hero.primaryCta}
      secondaryCta={hero.secondaryCta}
      video={heroVideo && posterUrl ? { url: heroVideo.url, posterUrl } : null}
    />
  );
}
