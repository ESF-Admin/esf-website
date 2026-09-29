/**
 * Single source of truth for every string on the landing page.
 *
 */

export const org = {
  name: "Evangelical Student Fellowship",
  shortName: "ESF",
  legalFooterName: "Evangelical Student Fellowship",
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

// Footer chrome — kept as its own const (rather than inline JSX) so it can
// serve as the fallback default once siteSettings moves into Sanity.
export const footerBlurb =
  "An international Christian student ministry on college and university campuses worldwide, and a multi-ethnic ministry in Chicago.";

export const navCtaLabel = "Get in touch";

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
  /** Word-doc URL, offered for Download and as the View fallback. */
  fileUrl?: string;
  /** Optional PDF — when present, View uses it directly (instant, native browser rendering). */
  pdfUrl?: string;
};

export type SermonEntry = {
  date: string;
  title: string;
  scripture?: string;
  /** Who preached — the sermon's own manuscript, distinct from the bulletin's order-of-service. */
  speaker?: string;
  fileUrl?: string;
  pdfUrl?: string;
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
      { label: "Young Adults", href: "/ministries" },
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
    "Ways to get plugged in.",
  items: [
    {
      name: "Young Adults",
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
    "Countries where ESF and its partners serve.",
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
  subtitle: "",
} as const;

export const contact = {
  title: "Contact Us",
  subtitle:
    "Questions about a gathering, or want someone to reach out? Send a note and we will get back to you.",
} as const;

// Per-page <title>/description fallback, used by each page's generateMetadata()
// until (or unless) an editor sets a page's own "Search & sharing" fields in
// Studio. Keys match the `page` document type's `slug` field.
export const pageSeoDefaults = {
  ministries: {
    title: "Ministries",
    description:
      "Get involved at Evangelical Student Fellowship in Chicago: Young Adults, Evangelism, Bible Studies, and Youth & Children ministries.",
  },
  missions: {
    title: "Missions",
    description:
      "Where ESF and its partners serve: Benin, Cuba, the Dominican Republic, Peru, the Philippines, the United States and Venezuela.",
  },
  history: {
    title: "Our History",
    description:
      "Evangelical Student Fellowship began in Seoul, Korea in 1976 and came to the U.S. through its alumni. Today ESF is a multi-ethnic ministry in Chicago.",
  },
  contact: {
    title: "Contact Us",
    description: `Visit Evangelical Student Fellowship at ${org.address}. ${service.day} worship at ${service.time}. Call, email, or send us a message.`,
  },
  bulletins: {
    title: "Sunday Bulletins",
    description:
      "Weekly Sunday service bulletins from Evangelical Student Fellowship in Chicago, in English, Spanish and French. Read online or download.",
  },
  sermons: {
    title: "Sermons",
    description:
      "Sunday sermon messages from Evangelical Student Fellowship in Chicago. Read online or download, newest first.",
  },
  privacy: {
    title: "Privacy Policy",
    description:
      "How Evangelical Student Fellowship collects, uses and protects the information you share on this website, including the contact form.",
  },
  terms: {
    title: "Terms of Use",
    description:
      "The terms for using the Evangelical Student Fellowship website, including how you may share our sermons, bulletins and other content.",
  },
} as const;

// Privacy Policy and Terms of Use. Each section's `body` is a list of
// paragraphs (strings) and bullet lists (string arrays), in order;
// `[label](href)` becomes a link. sectionsToBlocks() turns these into
// Portable Text for the page fallback and the seed script.
export type LegalSection = { heading: string; body: (string | string[])[] };

const emailLink = `[${org.email}](${org.emailHref})`;
const phoneLink = `[${org.phone}](${org.phoneHref})`;

const contactUs: LegalSection = {
  heading: "Contact us",
  body: [
    `${org.name}, ${org.address}`,
    `Email: ${emailLink} · Phone: ${phoneLink}`,
  ],
};

export const privacyPolicy = {
  eyebrow: "Legal",
  title: "Privacy Policy",
  intro:
    "How Evangelical Student Fellowship handles the information you share when you visit this website.",
  lastUpdated: "2026-09-29",
  sections: [
    {
      heading: "Who we are",
      body: [
        `This website is run by ${org.name} (${org.shortName}), a Christian ministry located at ${org.address}. In this policy, "we", "us" and "our" mean ${org.shortName}. If you have a question about your privacy, email us at ${emailLink} or call ${phoneLink}.`,
      ],
    },
    {
      heading: "Information you give us",
      body: [
        "When you send us a message through our contact form, we collect:",
        [
          "Your name and email address",
          "Your phone number, if you choose to include it",
          "The message you write",
        ],
        "We use this information only to read and answer your message. You do not need to give us any information to read or download anything on this site.",
      ],
    },
    {
      heading: "Information collected automatically",
      body: [
        "Like most websites, our site receives some technical information when a page loads:",
        [
          "Your IP address, browser and device type, which are recorded in standard server logs to deliver the site and protect it from attacks and abuse",
          "Anonymous visit statistics, such as which pages are viewed, the referring website, country, device type and how quickly pages load. These statistics do not use cookies and are not used to identify you.",
        ],
        "When you submit the contact form, we also record the date and time and your IP address with your message, to help us block spam.",
      ],
    },
    {
      heading: "Spam protection (Google reCAPTCHA)",
      body: [
        "Our contact page uses Google reCAPTCHA to check that messages are sent by people, not automated programs. reCAPTCHA collects hardware and software information, such as device and browser data, and sends it to Google for analysis. This site is protected by reCAPTCHA and the Google [Privacy Policy](https://policies.google.com/privacy) and [Terms of Service](https://policies.google.com/terms) apply.",
      ],
    },
    {
      heading: "How we use your information",
      body: [
        [
          "To reply to your message and follow up if you ask us to",
          "To send you one automatic email confirming we received your message",
          "To keep the website secure and prevent spam and abuse",
          "To understand, in general terms, how the site is used so we can improve it",
        ],
        "We do not sell, rent or trade your personal information. We do not add you to a mailing list or use your information for advertising.",
      ],
    },
    {
      heading: "Who we share it with",
      body: [
        "We share information only with trusted service providers that host and secure this website, store its content and messages, and deliver email for us. They may use it only to provide those services to us. We may also disclose information if the law requires it, or to protect the safety of our members, visitors or the public.",
        "Some features, such as map directions and previews of certain documents, use services run by other companies, which have their own privacy policies.",
      ],
    },
    {
      heading: "Cookies and similar technologies",
      body: [
        "We do not use advertising or tracking cookies, and our visit statistics work without cookies. If you choose a light or dark theme, your choice is saved in your own browser so the site remembers it; it is never sent to us. On the contact page, Google reCAPTCHA may set cookies it needs for spam protection.",
        "Do Not Track: we do not track visitors across other websites, so the site works the same way whether or not your browser sends a Do Not Track signal.",
      ],
    },
    {
      heading: "How long we keep information",
      body: [
        "We keep contact messages only as long as needed to respond to you and for ordinary ministry records. Server logs and security data are kept by our service providers for a limited time. You can ask us to delete your message at any time.",
      ],
    },
    {
      heading: "Your choices",
      body: [
        `You can ask us what information we have about you, and ask us to correct or delete it. Email us at ${emailLink} and we will respond within a reasonable time. We may need to confirm your identity first.`,
      ],
    },
    {
      heading: "Children's privacy",
      body: [
        "This website is meant for a general audience and is not directed to children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has sent us information, please contact us and we will delete it.",
      ],
    },
    {
      heading: "Security",
      body: [
        "The whole site uses encrypted connections (HTTPS), and contact messages are stored in a private system that only authorized ministry staff can access. No website can be completely secure, so please do not send sensitive information, such as financial or health details, through the contact form.",
      ],
    },
    {
      heading: "Visitors outside the United States",
      body: [
        `${org.shortName} is based in the United States, and this site is operated from the United States. If you visit from another country, your information will be processed in the United States.`,
      ],
    },
    {
      heading: "Changes to this policy",
      body: [
        'We may update this policy from time to time. When we do, we will change the "Last updated" date at the top of this page.',
      ],
    },
    contactUs,
  ] satisfies LegalSection[],
};

export const termsOfUse = {
  eyebrow: "Legal",
  title: "Terms of Use",
  intro:
    "The terms that apply when you use the Evangelical Student Fellowship website.",
  lastUpdated: "2026-09-29",
  sections: [
    {
      heading: "Acceptance of these terms",
      body: [
        "By using this website, you agree to these Terms of Use and to our [Privacy Policy](/privacy). If you do not agree, please do not use the site.",
      ],
    },
    {
      heading: "About this website",
      body: [
        `This website is run by ${org.name} (${org.shortName}), ${org.address}. It shares information about our ministry, worship services and activities, and makes our Sunday bulletins and sermons available to read and download.`,
      ],
    },
    {
      heading: "Using our content",
      body: [
        `Unless noted otherwise, the text, sermons, bulletins, images and other content on this site belong to ${org.shortName}. You are welcome to read, download, print and share them for personal, ministry and other non-commercial purposes, as long as you:`,
        [
          `Credit ${org.name} as the source`,
          "Do not change the content in a way that misrepresents its meaning",
          "Do not sell it or use it for commercial purposes",
        ],
        "Some material, such as Scripture quotations, belongs to its respective copyright holders. For any other use of our content, please contact us first.",
      ],
    },
    {
      heading: "Acceptable use",
      body: [
        "Please use this site respectfully. You agree not to:",
        [
          "Send spam, advertising, or abusive, threatening or unlawful messages through the contact form",
          "Pretend to be someone else or give false information",
          "Try to gain unauthorized access to the site, its systems or its admin areas",
          "Interfere with the site, for example by overloading it with automated requests or copying it in bulk",
        ],
        "We may block access for anyone who misuses the site.",
      ],
    },
    {
      heading: "Links to other websites",
      body: [
        "Our site links to services run by others, such as map directions. We do not control those websites and are not responsible for their content or practices.",
      ],
    },
    {
      heading: "No warranties",
      body: [
        'We work to keep this site accurate and available, but it is provided "as is". Service times, events and other details may change, and we do not promise that the site will always be complete, current or free of errors or interruptions.',
      ],
    },
    {
      heading: "Limitation of liability",
      body: [
        `To the fullest extent permitted by law, ${org.shortName} and its leaders, staff and volunteers are not liable for any loss or damage arising from your use of, or inability to use, this website or its content.`,
      ],
    },
    {
      heading: "Privacy",
      body: [
        "Our [Privacy Policy](/privacy) explains what information we collect and how we use it.",
      ],
    },
    {
      heading: "Governing law",
      body: [
        "These terms are governed by the laws of the State of Illinois, United States, without regard to its conflict-of-law rules.",
      ],
    },
    {
      heading: "Changes to these terms",
      body: [
        'We may update these terms from time to time. The "Last updated" date at the top of this page shows when they last changed. If you keep using the site after a change, you accept the updated terms.',
      ],
    },
    contactUs,
  ] satisfies LegalSection[],
};
