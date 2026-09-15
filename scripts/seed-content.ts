/**
 * Seeds the siteSettings, navigation and homePage singletons, plus the six
 * `page` documents (ministries/missions/history/contact/bulletins/sermons),
 * from lib/content.ts's current defaults — so every CMS document starts out
 * identical to what the site already renders. Safe to re-run
 * (createIfNotExists is a no-op once a document exists) and safe to run
 * before the reading components are wired up.
 *
 *   npx sanity exec scripts/seed-content.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";
import {
  org,
  service,
  footerBlurb,
  navCtaLabel,
  navLinks,
  hero,
  mission,
  ministries,
  missions,
  story,
  contact,
  pageSeoDefaults,
} from "../lib/content";

const client = getCliClient();

const DEFAULT_SEO = {
  title: `${org.name} (ESF) — Campus Ministry`,
  description:
    "Evangelical Student Fellowship is an international Christian student ministry on college and university campuses worldwide, and a multi-ethnic ministry in Chicago. Founded in Seoul, Korea in 1976.",
};

function cta(label: string, href: string) {
  return { _type: "cta", label, href };
}

function seo(slug: keyof typeof pageSeoDefaults) {
  return { _type: "seo", ...pageSeoDefaults[slug] };
}

async function run() {
  const tx = client.transaction();

  tx.createIfNotExists({
    _id: "siteSettings",
    _type: "siteSettings",
    orgName: org.name,
    shortName: org.shortName,
    legalFooterName: org.legalFooterName,
    phone: org.phone,
    phoneHref: org.phoneHref,
    email: org.email,
    emailHref: org.emailHref,
    address: org.address,
    mapUrl: org.mapUrl,
    copyrightYear: org.copyrightYear,
    serviceDay: service.day,
    serviceTime: service.time,
    serviceNote: service.note,
    footerBlurb,
    navCtaLabel,
    defaultSeo: { _type: "seo", ...DEFAULT_SEO },
  });
  // siteSettings may already exist from an earlier run (Phase 1, before
  // defaultSeo existed) — backfill it there without touching anything an
  // admin may have already edited.
  tx.patch("siteSettings", { setIfMissing: { defaultSeo: { _type: "seo", ...DEFAULT_SEO } } });

  tx.createIfNotExists({
    _id: "navigation",
    _type: "navigation",
    items: navLinks.map((link) => ({
      _type: "navItem",
      _key: link.href,
      label: link.label,
      href: link.href,
      childSource: link.children ? "manual" : "none",
      children: link.children?.map((child) => ({
        _type: "navChildLink",
        _key: `${link.href}:${child.href}:${child.label}`,
        label: child.label,
        href: child.href,
      })),
    })),
  });

  tx.createIfNotExists({
    _id: "homePage",
    _type: "homePage",
    hero: {
      eyebrow: hero.eyebrow,
      title: hero.title,
      body: hero.body,
      primaryCta: cta(hero.primaryCta.label, hero.primaryCta.href),
      secondaryCta: cta(hero.secondaryCta.label, hero.secondaryCta.href),
    },
    mission: { title: mission.title, statement: mission.statement },
    contactCta: {
      title: "Have a question? We'd love to hear from you.",
      subtitle: "Reach out about a gathering, a ministry, or just to say hello.",
      cta: cta("Get in touch", "/contact"),
    },
  });

  tx.createIfNotExists({
    _id: "page.ministries",
    _type: "page",
    slug: "ministries",
    title: ministries.title,
    intro: ministries.subtitle,
    items: ministries.items.map((m) => ({ _type: "object", _key: m.name, ...m })),
    seo: seo("ministries"),
  });

  tx.createIfNotExists({
    _id: "page.missions",
    _type: "page",
    slug: "missions",
    title: missions.title,
    intro: missions.subtitle,
    countries: [...missions.countries],
    seo: seo("missions"),
  });

  tx.createIfNotExists({
    _id: "page.history",
    _type: "page",
    slug: "history",
    eyebrow: story.tagline,
    title: story.title,
    paragraphs: [...story.paragraphs],
    milestones: story.milestones.map((m) => ({ _type: "object", _key: m.year, ...m })),
    seo: seo("history"),
  });

  tx.createIfNotExists({
    _id: "page.contact",
    _type: "page",
    slug: "contact",
    title: contact.title,
    intro: contact.subtitle,
    seo: seo("contact"),
  });

  tx.createIfNotExists({
    _id: "page.bulletins",
    _type: "page",
    slug: "bulletins",
    eyebrow: "Bulletin archive",
    title: "Bulletins",
    intro: "Every Sunday service bulletin, most recent first.",
    tabsLabel: "Bulletin language",
    emptyText: "No bulletins have been published in this language yet.",
    seo: seo("bulletins"),
  });

  tx.createIfNotExists({
    _id: "page.sermons",
    _type: "page",
    slug: "sermons",
    eyebrow: "Sermon archive",
    title: "Sermons",
    intro: "Every Sunday sermon message, most recent first.",
    tabsLabel: "Sermon language",
    emptyText: "No sermons have been published in this language yet.",
    seo: seo("sermons"),
  });

  const result = await tx.commit();
  console.log("Seeded content documents.", result);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
