import { getSiteSettings, getNavigation, getHomePage } from "@/lib/sanity/queries";
import { NavClient } from "./nav-client";

/**
 * Server wrapper — fetches CMS-driven nav items + org/CTA chrome, then hands
 * off to the client component for all the interactive behavior (scroll
 * state, mobile menu, active-link highlighting). Also checks whether the
 * homepage has a background video: while unscrolled there, the nav floats
 * with no background of its own over a dark video, so NavClient needs to
 * know to render light text instead of its normal theme-adaptive colors.
 */
export async function Nav() {
  const [settings, navLinks, homePage] = await Promise.all([
    getSiteSettings(),
    getNavigation(),
    getHomePage(),
  ]);

  return (
    <NavClient
      navLinks={navLinks}
      orgName={settings.org.name}
      ctaLabel={settings.navCtaLabel}
      homeHasVideo={homePage.heroVideo !== null}
    />
  );
}
