/**
 * Seeds the siteSettings and navigation singletons from lib/content.ts's
 * current defaults, so the CMS documents start out identical to what the
 * site already renders — nothing changes visually the moment nav.tsx,
 * footer.tsx and sunday-service.tsx start reading from Sanity instead of
 * the hardcoded defaults. Safe to re-run (createIfNotExists is a no-op
 * once the documents exist) and safe to run before those components are
 * wired up (they'll just keep reading the same values from content.ts).
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
} from "../lib/content";

const client = getCliClient();

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
  });

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

  const result = await tx.commit();
  console.log("Seeded siteSettings and navigation.", result);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
