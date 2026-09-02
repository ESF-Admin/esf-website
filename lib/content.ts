/**
 * Single source of truth for every string on the landing page.
 *
 * Anything marked `placeholder: true` is filler for layout only — it is
 * rendered with a visible "Placeholder" badge and must be replaced before
 * launch. Real, verified ESF facts live in `org`, `story` and `mission`.
 */

export const org = {
  name: "Evangelical Student Fellowship",
  shortName: "ESF",
  legalFooterName: "Evangelical Students Fellowship",
  phone: "+1 (773) 802-1112",
  phoneHref: "tel:+17738021112",
  email: "esfcross@yahoo.com",
  emailHref: "mailto:esfcross@yahoo.com",
  address: "6050 W Touhy Ave, Chicago, IL 60646",
  // ESF's Google Maps listing — "view on map" links go straight here.
  mapUrl: "https://maps.app.goo.gl/TYYifGbsa6AK7YK9A",
  copyrightYear: 2026,
} as const;

export const service = {
  day: "Sunday",
  time: "11:30 AM",
  note: "Join us in-person.",
} as const;

export type NavChild = { label: string; href: string };
export type NavLink = { label: string; href: string; children?: NavChild[] };

// Single source of truth for the mission field list — the nav dropdown maps
// over this so it can never drift out of alphabetical sync with the section.
const missionCountries = [
  "Benin",
  "Cuba",
  "Dominican Republic",
  "Peru",
  "Philippines",
  "United States",
  "Venezuela",
] as const;

export type DocLocale = "en" | "es" | "fr";

// Bulletins and sermons are both weekly-published documents with a
// date/title/scripture shape, so they share the language list — the nav
// dropdown and both archive pages' tabs map over this.
export const docLocales: { code: DocLocale; label: string }[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
];

export type BulletinEntry = {
  /** ISO date — the single sort key, so the list can never drift out of order. */
  date: string;
  title: string;
  scripture?: string;
  /** Word-doc URL, offered for Download and as the View fallback. */
  fileUrl?: string;
  /** Optional PDF — when present, View uses it directly (instant, native browser rendering). */
  pdfUrl?: string;
};

export type SermonEntry = BulletinEntry & {
  /** Who preached — the sermon's own manuscript, distinct from the bulletin's order-of-service. */
  speaker?: string;
};

// Bulletin and sermon entries themselves live in Sanity (see
// lib/sanity/queries.ts) so the church admin can publish a new one every
// week without a code change. The one-time migration of the original 33
// hand-sourced bulletins lives in scripts/seed-bulletins.ts.
export const bulletins = {
  title: "Bulletins",
  subtitle: "Weekly Sunday service bulletins.",
} as const;

export const sermons = {
  title: "Sermons",
  subtitle: "Full sermon messages from our Sunday gatherings.",
} as const;

// Every top-level link is a real route — no "/#section" hash anchors. Dropdown
// children are shown on hover/focus (desktop) or as an inline disclosure list
// (mobile).
export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  {
    label: "Bulletins",
    href: "/bulletins",
    children: docLocales.map(({ code, label }) => ({
      label,
      href: `/bulletins?lang=${code}`,
    })),
  },
  {
    label: "Ministries",
    href: "/ministries",
    children: [
      { label: "Adult", href: "/ministries" },
      { label: "Evangelism", href: "/ministries" },
      { label: "Bible Studies", href: "/ministries" },
      { label: "Youth & Children", href: "/ministries" },
    ],
  },
  {
    label: "Missions",
    href: "/missions",
    children: missionCountries.map((label) => ({ label, href: "/missions" })),
  },
  {
    label: "Sermons",
    href: "/sermons",
    children: docLocales.map(({ code, label }) => ({
      label,
      href: `/sermons?lang=${code}`,
    })),
  },
  { label: "History", href: "/history" },
] as const;

export const hero = {
  eyebrow: "Campus ministry since 1976",
  title: "Welcome to ESF",
  body: "Evangelical Student Fellowship is an international Christian student ministry active on college and university campuses worldwide, and a multi-ethnic ministry in Chicago.",
  primaryCta: { label: "Join our community", href: "/contact" },
  secondaryCta: { label: "Read our story", href: "/history" },
} as const;

export const ministries = {
  title: "Ministries",
  subtitle:
    "Ways to get plugged in. Sample descriptions below show the layout.",
  placeholder: true,
  items: [
    {
      name: "Adult",
      body: "Fellowship and discipleship for graduate students, working professionals and alumni.",
    },
    {
      name: "Evangelism",
      body: "Sharing the gospel on campus and across the city through outreach and conversation.",
    },
    {
      name: "Bible Studies",
      body: "Small-group study working through Scripture together, week to week.",
    },
    {
      name: "Youth & Children",
      body: "Age-appropriate teaching and activities for the youngest members of our community.",
    },
  ],
} as const;

export const missions = {
  title: "Missions",
  subtitle:
    "Countries where ESF and its partners serve. Sample list shown for layout — add, remove or update at any time.",
  placeholder: true,
  countries: missionCountries,
} as const;

export const story = {
  tagline: "Join Our Community of Faith",
  title: "Our Story",
  paragraphs: [
    "Evangelical Student Fellowship was founded in Seoul, Korea in 1976 by Christian students concerned about world evangelism through reaching out to college students.",
    "In the late 1970s and early 1980s, several ESF alumni immigrated to the U.S.A. and began praying to continue campus ministry for young students in America.",
  ],
  milestones: [
    {
      year: "1976",
      title: "Founded in Seoul",
      body: "Christian students in Seoul, Korea start ESF out of a concern for world evangelism through reaching college students.",
    },
    {
      year: "Late 1970s",
      title: "Alumni head to the U.S.",
      body: "ESF alumni immigrate to the United States, carrying the vision for campus ministry with them.",
    },
    {
      year: "1980s",
      title: "Praying for American campuses",
      body: "Those alumni begin praying to continue campus ministry for young students in America.",
    },
    {
      year: "Today",
      title: "Worldwide and in Chicago",
      body: "ESF serves students on campuses worldwide and is a multi-ethnic ministry in Chicago.",
    },
  ],
} as const;

export const mission = {
  title: "Our Mission",
  statement:
    "We are dedicated to creating a community of young Christians who are passionate about their faith and eager to make a positive impact on the world. Our mission is to provide a supportive and nurturing environment for people to grow spiritually and equip them to be leaders in their communities.",
} as const;

export const testimonials = {
  title: "Student Stories",
  subtitle: "Sample quotes shown to demonstrate the layout.",
  placeholder: true,
  items: [
    {
      quote:
        "Sample testimonial text. This space is reserved for a student's own words about what the fellowship has meant to them during their time on campus.",
      name: "Student name",
      role: "Undergraduate · Sample university",
    },
    {
      quote:
        "Sample testimonial text. A second story goes here — how someone found community, and what they are learning about faith alongside their studies.",
      name: "Student name",
      role: "Graduate student · Sample university",
    },
    {
      quote:
        "Sample testimonial text. A third story rounds out the carousel, ideally from an alum reflecting on the years after graduation.",
      name: "Alum name",
      role: "Alum · Class year",
    },
  ],
} as const;

export const contact = {
  title: "Contact Us",
  subtitle:
    "Questions about a gathering, or want someone to reach out? Send a note and we will get back to you.",
} as const;

export type SocialName =
  | "Facebook"
  | "X"
  | "YouTube"
  | "Instagram"
  | "LinkedIn";

export const socials: { name: SocialName; href: string; label: string }[] = [
  { name: "Facebook", href: "https://www.facebook.com/", label: "ESF on Facebook" },
  { name: "X", href: "https://x.com/", label: "ESF on X (formerly Twitter)" },
  { name: "YouTube", href: "https://www.youtube.com/", label: "ESF on YouTube" },
  { name: "Instagram", href: "https://www.instagram.com/", label: "ESF on Instagram" },
  { name: "LinkedIn", href: "https://www.linkedin.com/", label: "ESF on LinkedIn" },
];
