import { test, expect } from "@playwright/test";

// This suite runs against whatever Sanity project .env.local points at.
// English has at least one real published sermon; Spanish and French are
// schema-ready with zero entries (see PROJECT_CONTEXT.md §16) — so the two
// locale groups exercise genuinely different states rather than assuming
// the project is unconfigured.
test.describe("Sermons archive page", () => {
  test("renders the page shell and language tabs", async ({ page }) => {
    await page.goto("/sermons?lang=en");

    await expect(
      page.getByRole("heading", { level: 1, name: "Sermons" }),
    ).toBeVisible();

    const tabs = page.getByRole("tablist", { name: "Sermon language" });
    await expect(tabs.getByRole("tab", { name: "English" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(tabs.getByRole("tab", { name: "Spanish" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  test("English shows real published sermons, not the empty state", async ({
    page,
  }) => {
    await page.goto("/sermons?lang=en");
    await expect(page.getByRole("tab", { name: "English" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(
      page.getByText(/no sermons have been published in this language yet/i),
    ).not.toBeVisible();
    // At least one real entry rendered — checked structurally (a document
    // row's title heading), not against a specific sermon's title/date.
    await expect(page.getByRole("heading", { level: 3 }).first()).toBeVisible();
  });

  test("Spanish and French show the not-yet-published empty state", async ({
    page,
  }) => {
    for (const [lang, label] of [
      ["es", "Spanish"],
      ["fr", "French"],
    ] as const) {
      await page.goto(`/sermons?lang=${lang}`);
      await expect(
        page.getByRole("tab", { name: label }),
      ).toHaveAttribute("aria-selected", "true");
      await expect(
        page.getByText(/no sermons have been published in this language yet/i),
      ).toBeVisible();
    }
  });

  test("switching tabs updates the URL", async ({ page }) => {
    await page.goto("/sermons?lang=en");
    await page.getByRole("tab", { name: "French" }).click();
    await expect(page).toHaveURL(/lang=fr$/);
  });

  test("reached from the nav Sermons > English hover menu", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main" });
    const sermonsItem = nav.getByRole("link", { name: "Sermons", exact: true });
    await sermonsItem.hover();

    const menu = sermonsItem.locator("xpath=../div").first();
    await menu.getByRole("link", { name: "English" }).click();

    await expect(page).toHaveURL(/\/sermons\?lang=en$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Sermons" }),
    ).toBeVisible();
  });
});

test.describe("Sermon viewer route", () => {
  test("404s without a src param", async ({ request }) => {
    const res = await request.get("/sermons/view", { maxRedirects: 0 });
    expect(res.status()).toBe(404);
  });

  test("404s for a file URL outside Sanity's CDN", async ({ request }) => {
    const res = await request.get(
      `/sermons/view?src=${encodeURIComponent("https://evil.example.com/sermon.docx")}`,
      { maxRedirects: 0 },
    );
    expect(res.status()).toBe(404);
  });
});
