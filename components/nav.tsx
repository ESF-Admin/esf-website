import { getSiteSettings, getNavigation } from "@/lib/sanity/queries";
import { NavClient } from "./nav-client";

/**
 * Server wrapper — fetches CMS-driven nav items + org/CTA chrome, then hands
 * off to the client component for all the interactive behavior (scroll
 * state, mobile menu, active-link highlighting).
 */
export async function Nav() {
  const [settings, navLinks] = await Promise.all([
    getSiteSettings(),
    getNavigation(),
  ]);

  return (
    <NavClient
      navLinks={navLinks}
      orgName={settings.org.name}
      ctaLabel={settings.navCtaLabel}
    />
  );
}
