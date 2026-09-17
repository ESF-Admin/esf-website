import { test, expect } from "@playwright/test";

// Hits app/api/contact/route.ts directly (not through the browser UI) to
// exercise its abuse defenses precisely: honeypot, per-field length caps,
// the request-body size guard, and the shared-IP rate limit. Each test uses
// its own x-forwarded-for value so they don't share a rate-limit bucket
// with each other or with the browser-driven happy path in landing.spec.ts.

test.describe("Contact API — validation and abuse defenses", () => {
  test("honeypot field silently succeeds without sending", async ({ request }) => {
    const res = await request.post("/api/contact", {
      headers: { "x-forwarded-for": "203.0.113.10" },
      data: {
        name: "Bot",
        email: "bot@example.com",
        message: "This is a spam message from a bot filling every field.",
        company: "Acme Corp",
      },
    });
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  test("oversized message is rejected", async ({ request }) => {
    const res = await request.post("/api/contact", {
      headers: { "x-forwarded-for": "203.0.113.11" },
      data: {
        name: "Sample Person",
        email: "person@example.com",
        message: "x".repeat(5001),
      },
    });
    expect(res.status()).toBe(400);
  });

  test("oversized name is rejected", async ({ request }) => {
    const res = await request.post("/api/contact", {
      headers: { "x-forwarded-for": "203.0.113.12" },
      data: {
        name: "x".repeat(121),
        email: "person@example.com",
        message: "A normal, valid-length message for testing purposes.",
      },
    });
    expect(res.status()).toBe(400);
  });

  test("request bodies over the size cap are rejected with 413", async ({ request }) => {
    const res = await request.post("/api/contact", {
      headers: { "x-forwarded-for": "203.0.113.13" },
      data: {
        name: "Sample Person",
        email: "person@example.com",
        message: "y".repeat(25_000),
      },
    });
    expect(res.status()).toBe(413);
  });

  test("more than 3 requests per hour from the same IP are rate limited", async ({
    request,
  }) => {
    const ip = "203.0.113.14";
    const payload = {
      name: "Sample Person",
      email: "person@example.com",
      message: "A normal, valid-length message for testing purposes.",
    };

    for (let i = 0; i < 3; i++) {
      const res = await request.post("/api/contact", {
        headers: { "x-forwarded-for": ip },
        data: payload,
      });
      expect(res.status()).not.toBe(429);
    }

    const fourth = await request.post("/api/contact", {
      headers: { "x-forwarded-for": ip },
      data: payload,
    });
    expect(fourth.status()).toBe(429);
  });
});
