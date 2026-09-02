import { test, expect, type Page } from "@playwright/test";

const NAV = ["Home", "Bulletins", "Ministries", "Missions", "Sermons", "History"];

/** Collects console errors and page errors from load onward. */
function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));
  return errors;
}

test.describe("ESF landing page", () => {
  test("loads with correct title and meta", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(
      /Evangelical Student Fellowship \(ESF\) — Campus Ministry/,
    );

    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute(
      "content",
      /international Christian student ministry/,
    );

    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      /Evangelical Student Fellowship/,
    );
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
      "content",
      "website",
    );
    // Indexing is off by default and configurable via NEXT_PUBLIC_ALLOW_INDEXING.
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
  });

  test("hero renders the headline and intro copy", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { level: 1, name: "Welcome to ESF" }),
    ).toBeVisible();
    await expect(
      page.getByText(/multi-ethnic ministry in Chicago/).first(),
    ).toBeVisible();
  });

  test("story, mission and contact facts match the source content", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page.getByText(/founded in Seoul, Korea in 1976/i).first(),
    ).toBeVisible();
    await expect(
      page.getByText(/supportive and nurturing environment/).first(),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /\+1 \(773\) 802-1112/ }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /esfcross@yahoo\.com/ }).first()).toBeVisible();
    await expect(
      page.getByText("© 2026 Evangelical Students Fellowship"),
    ).toBeVisible();
  });

  test("placeholder sections are visibly flagged", async ({ page }) => {
    await page.goto("/");
    // Ministries, Missions and Student Stories each carry a badge.
    // Bulletins and Sermons are Sanity-backed real data and carry none.
    await expect(page.getByText("Placeholder content")).toHaveCount(3);
  });

  test("bulletins teaser shows the not-yet-published fallback and links to the archive", async ({
    page,
  }) => {
    // No Sanity project is configured in this environment, so the teaser
    // renders its empty state rather than real entries — see tests/bulletins.spec.ts
    // for the data-bearing assertions once a real project is wired up.
    await page.goto("/");
    const section = page.locator("#bulletins");

    await expect(
      section.getByText(/bulletins will appear here once published/i),
    ).toBeVisible();

    await section.getByRole("link", { name: /view the full bulletin archive/i }).click();
    await expect(page).toHaveURL(/\/bulletins\?lang=en$/);
  });

  test("sermons teaser shows the not-yet-published fallback and links to the archive", async ({
    page,
  }) => {
    await page.goto("/");
    const section = page.locator("#sermon");

    await expect(
      section.getByText(/sermons will appear here once published/i),
    ).toBeVisible();

    await section.getByRole("link", { name: /view the full sermon archive/i }).click();
    await expect(page).toHaveURL(/\/sermons\?lang=en$/);
  });

  test("nav links exist and route to real pages, no hash anchors", async ({
    page,
  }) => {
    await page.goto("/bulletins");
    const nav = page.getByRole("navigation", { name: "Main" });

    for (const label of NAV) {
      await expect(nav.getByRole("link", { name: label, exact: true })).toHaveCount(
        1,
      );
    }

    // Every top-level link is a real route — clicking it must never leave a
    // "#hash" in the URL, and each destination renders its own heading.
    for (const [label, path, heading] of [
      ["Bulletins", "/bulletins", "Bulletins"],
      ["Ministries", "/ministries", "Ministries"],
      ["Missions", "/missions", "Missions"],
      ["Sermons", "/sermons", "Sermons"],
      ["History", "/history", "Our Story"],
    ] as const) {
      await nav.getByRole("link", { name: label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`${path}$`));
      expect(page.url()).not.toContain("#");
      await expect(
        page.getByRole("heading", { level: 1, name: heading }),
      ).toBeVisible();
    }
  });

  test("logo and Home link both go to a clean \"/\", no hash", async ({
    page,
  }) => {
    await page.goto("/history");
    const nav = page.getByRole("navigation", { name: "Main" });

    await nav.getByRole("link", { name: "Home", exact: true }).click();
    await expect(page).toHaveURL(/\/$/);
    expect(page.url()).not.toContain("#");

    await page.goto("/history");
    await page.getByRole("link", { name: /— home$/ }).click();
    await expect(page).toHaveURL(/\/$/);
    expect(page.url()).not.toContain("#");
  });

  test("Bulletins and Sermons expose language dropdowns on hover", async ({
    page,
  }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main" });

    for (const label of ["Bulletins", "Sermons"]) {
      const item = nav.getByRole("link", { name: label, exact: true });
      await item.hover();
      const menu = item.locator("xpath=../div").first();
      await expect(menu.getByRole("link", { name: "English" })).toBeVisible();
      await expect(menu.getByRole("link", { name: "Spanish" })).toBeVisible();
      await expect(menu.getByRole("link", { name: "French" })).toBeVisible();
    }
  });

  test("Ministries dropdown lists the four ministry areas", async ({
    page,
  }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main" });
    const item = nav.getByRole("link", { name: "Ministries", exact: true });
    await item.hover();
    const menu = item.locator("xpath=../div").first();

    for (const label of ["Adult", "Evangelism", "Bible Studies", "Youth & Children"]) {
      await expect(menu.getByRole("link", { name: label })).toBeVisible();
    }
  });

  test("Missions dropdown lists the seven mission countries alphabetically", async ({
    page,
  }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main" });
    const item = nav.getByRole("link", { name: "Missions", exact: true });
    await item.hover();
    const menu = item.locator("xpath=../div").first();

    await expect(menu.getByRole("listitem")).toHaveCount(7);
    await expect(menu.getByRole("listitem")).toHaveText([
      "Benin",
      "Cuba",
      "Dominican Republic",
      "Peru",
      "Philippines",
      "United States",
      "Venezuela",
    ]);
  });

  test("contact form shows validation errors and then submits", async ({
    page,
  }) => {
    await page.goto("/contact");

    const form = page.getByRole("form", { name: "Contact form" });
    await form.getByRole("button", { name: "Send message" }).click();

    await expect(form.getByText("Please enter your name.")).toBeVisible();
    await expect(
      form.getByText("Please enter your email address."),
    ).toBeVisible();
    await expect(form.getByText("Please enter a message.")).toBeVisible();
    // Focus moves to the first invalid field.
    await expect(form.getByLabel(/^Name/)).toBeFocused();

    // A bad email is rejected on its own.
    await form.getByLabel(/^Name/).fill("Sample Person");
    await form.getByLabel(/^Email/).fill("not-an-email");
    await form.getByLabel(/^Message/).fill("Hello, I would like to visit.");
    await form.getByRole("button", { name: "Send message" }).click();
    await expect(form.getByText(/Enter a valid email address/)).toBeVisible();

    // Fixing it lets the form through.
    await form.getByLabel(/^Email/).fill("person@example.com");
    await form.getByRole("button", { name: "Send message" }).click();
    await expect(form.getByText(/your message has been received/i)).toBeVisible();
  });

  test("testimonial carousel advances", async ({ page }) => {
    await page.goto("/");

    const carousel = page.getByRole("group", { name: "Student stories" });
    await carousel.scrollIntoViewIfNeeded();

    const first = await carousel.locator("blockquote p").first().innerText();
    await carousel.getByRole("button", { name: "Next story" }).click();
    await expect
      .poll(async () => carousel.locator("blockquote p").first().innerText())
      .not.toBe(first);
  });

  test("theme toggle flips the colour theme", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");

    await expect.poll(() => html.getAttribute("class")).toMatch(/light|dark/);
    const before = await html.getAttribute("class");

    await page
      .getByRole("button", { name: /Switch to (light|dark) mode/ })
      .click();

    await expect.poll(() => html.getAttribute("class")).not.toBe(before);
  });

  test("no console errors on load", async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto("/", { waitUntil: "networkidle" });
    expect(errors).toEqual([]);
  });
});

test.describe("mobile layout", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("renders without horizontal overflow and opens the menu", async ({
    page,
  }) => {
    const errors = watchErrors(page);
    await page.goto("/");

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);

    await expect(
      page.getByRole("heading", { level: 1, name: "Welcome to ESF" }),
    ).toBeVisible();

    const toggle = page.getByRole("button", { name: "Open menu" });
    await expect(toggle).toBeVisible();
    await toggle.click();

    const menu = page.locator("#mobile-menu");
    const contactCta = menu.getByRole("link", { name: "Get in touch" });
    await expect(contactCta).toBeVisible();

    await contactCta.click();
    await expect(page).toHaveURL(/\/contact$/);
    expect(page.url()).not.toContain("#");

    expect(errors).toEqual([]);
  });

  test("controls and inputs meet the 44px touch target minimum", async ({
    page,
  }) => {
    await page.goto("/");

    // Inline prose links are exempt; this covers buttons, icon links and inputs.
    const tooSmall = await page.evaluate(() => {
      const nodes = document.querySelectorAll<HTMLElement>(
        "button, a[aria-label], input, textarea",
      );
      return [...nodes]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && r.height < 44;
        })
        .map((el) => `${el.tagName}:${el.textContent?.trim().slice(0, 24)}`);
    });

    expect(tooSmall).toEqual([]);
  });
});
