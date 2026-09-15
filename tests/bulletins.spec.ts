import { test, expect } from "@playwright/test";

// This suite runs against whatever Sanity project .env.local points at.
// English has real published bulletins (33 migrated from the prior site);
// Spanish and French are schema-ready with zero entries (see
// PROJECT_CONTEXT.md §16) — so the two locale groups exercise genuinely
// different states rather than assuming the project is unconfigured.
test.describe("Bulletins archive page", () => {
  test("renders the page shell and language tabs", async ({ page }) => {
    await page.goto("/bulletins?lang=en");

    await expect(
      page.getByRole("heading", { level: 1, name: "Bulletins" }),
    ).toBeVisible();

    const tabs = page.getByRole("tablist", { name: "Bulletin language" });
    await expect(tabs.getByRole("tab", { name: "English" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(tabs.getByRole("tab", { name: "Spanish" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  test("English shows real published bulletins, not the empty state", async ({
    page,
  }) => {
    await page.goto("/bulletins?lang=en");
    await expect(page.getByRole("tab", { name: "English" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(
      page.getByText(/no bulletins have been published in this language yet/i),
    ).not.toBeVisible();
    // At least one real entry rendered — checked structurally (a document
    // row's title heading), not against a specific bulletin's title/date,
    // since new bulletins are published weekly and old ones may roll off
    // the current page.
    await expect(page.getByRole("heading", { level: 3 }).first()).toBeVisible();
  });

  test("Spanish and French show the not-yet-published empty state", async ({
    page,
  }) => {
    for (const [lang, label] of [
      ["es", "Spanish"],
      ["fr", "French"],
    ] as const) {
      await page.goto(`/bulletins?lang=${lang}`);
      await expect(
        page.getByRole("tab", { name: label }),
      ).toHaveAttribute("aria-selected", "true");
      await expect(
        page.getByText(/no bulletins have been published in this language yet/i),
      ).toBeVisible();
    }
  });

  test("switching tabs updates the URL", async ({ page }) => {
    await page.goto("/bulletins?lang=en");
    await page.getByRole("tab", { name: "French" }).click();
    await expect(page).toHaveURL(/lang=fr$/);
  });

  test("reached from the nav Bulletins > English hover menu", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main" });
    const bulletinsItem = nav.getByRole("link", { name: "Bulletins", exact: true });
    await bulletinsItem.hover();

    const menu = bulletinsItem.locator("xpath=../div").first();
    await menu.getByRole("link", { name: "English" }).click();

    await expect(page).toHaveURL(/\/bulletins\?lang=en$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Bulletins" }),
    ).toBeVisible();
  });
});

test.describe("Bulletin viewer route", () => {
  test("404s without a src param", async ({ request }) => {
    const res = await request.get("/bulletins/view", { maxRedirects: 0 });
    expect(res.status()).toBe(404);
  });

  test("404s for a file URL outside Sanity's CDN", async ({ request }) => {
    const res = await request.get(
      `/bulletins/view?src=${encodeURIComponent("https://evil.example.com/bulletin.docx")}`,
      { maxRedirects: 0 },
    );
    expect(res.status()).toBe(404);
  });
});
