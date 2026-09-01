import { test, expect } from "@playwright/test";

// No Sanity project is configured in this environment (NEXT_PUBLIC_SANITY_PROJECT_ID
// unset), so getSanityClient() returns null and every locale renders the
// empty state. These tests cover the page shell, tab navigation and the
// nav → archive route wiring — the content itself is exercised once a real
// Sanity project is provisioned (see .env.local.example).
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

  test("every locale shows the not-yet-published empty state", async ({
    page,
  }) => {
    for (const [lang, label] of [
      ["en", "English"],
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
