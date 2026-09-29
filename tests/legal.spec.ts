import { test, expect } from "@playwright/test";

const PAGES = [
  { link: "Privacy Policy", path: "/privacy" },
  { link: "Terms of Use", path: "/terms" },
];

test.describe("Legal pages", () => {
  for (const { link, path } of PAGES) {
    test(`footer links to ${link}`, async ({ page }) => {
      await page.goto("/");
      await page.getByRole("navigation", { name: "Legal" }).getByRole("link", { name: link }).click();

      await expect(page).toHaveURL(path);
      await expect(page.getByRole("heading", { level: 1, name: link })).toBeVisible();
      await expect(page.getByText("Last updated:")).toBeVisible();
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`${path}$`));
    });
  }

  test("privacy policy names reCAPTCHA and links Google's policy", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.getByRole("heading", { level: 2, name: /reCAPTCHA/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "Privacy Policy" }).first()).toBeVisible();
    await expect(page.locator('a[href="https://policies.google.com/privacy"]')).toHaveCount(1);
  });

  test("contact form links to the privacy policy", async ({ page }) => {
    await page.goto("/contact");
    const form = page.getByRole("form", { name: "Contact form" });
    await form.getByRole("link", { name: "Privacy Policy" }).click();
    await expect(page).toHaveURL("/privacy");
  });

  test("sitemap lists both pages", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    expect(xml).toContain("/privacy</loc>");
    expect(xml).toContain("/terms</loc>");
  });
});
