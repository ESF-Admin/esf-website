import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSiteSettings } from "@/lib/sanity/queries";
import { getInternalSanityClient } from "@/lib/sanity/internal-client";
import { contactNotificationEmail, contactAutoReplyEmail } from "@/lib/email/contact-templates";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const MAX_BODY_BYTES = 20_000;
const MAX_NAME = 120;
const MAX_EMAIL = 200;
const MAX_PHONE = 30;
const MAX_MESSAGE = 5000;
const MIN_MESSAGE = 10;

// ponytail: in-memory rate limit — resets on cold start and isn't shared
// across serverless instances, so it's a soft "slow down a bot on this
// instance" guard, not a hard cap. Kept as a cheap backup now that
// reCAPTCHA below is the real bot gate — a bot that fails reCAPTCHA never
// reaches this check, so per-instance imprecision here matters much less.
const hits = new Map<string, number[]>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 3;

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

/**
 * Verifies a reCAPTCHA v3 token server-side. Skips (returns true) when
 * RECAPTCHA_SECRET_KEY isn't set, matching this route's existing
 * degrade-don't-throw convention for unprovisioned services — local dev
 * without a reCAPTCHA account still works.
 */
async function verifyRecaptcha(token: string | undefined, ip: string) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;

  try {
    const params = new URLSearchParams({ secret, response: token, remoteip: ip });
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });
    const data: { success?: boolean; score?: number } = await res.json();
    return !!data.success && (data.score ?? 0) >= 0.5;
  } catch (err) {
    console.error("reCAPTCHA verification failed:", err);
    return false;
  }
}

type Body = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  recaptchaToken?: string;
  // Honeypot — real visitors never fill this (it's hidden via CSS).
  company?: string;
};

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many messages sent recently. Please try again later." },
      { status: 429 },
    );
  }

  // Reject an oversized request before buffering the body into memory.
  // Content-Length is client-reported and can be spoofed/omitted, but this
  // still stops the common case (a naive bot posting a huge payload) cheaply.
  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request too large." }, { status: 413 });
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot tripped — pretend success so the bot doesn't learn to adapt.
  if (body.company) {
    return NextResponse.json({ ok: true });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const phone = (body.phone ?? "").trim();
  const message = (body.message ?? "").trim();

  const valid =
    name.length > 0 &&
    name.length <= MAX_NAME &&
    EMAIL.test(email) &&
    email.length <= MAX_EMAIL &&
    phone.length <= MAX_PHONE &&
    message.length >= MIN_MESSAGE &&
    message.length <= MAX_MESSAGE;

  if (!valid) {
    return NextResponse.json({ error: "Please check the form and try again." }, { status: 400 });
  }

  if (!(await verifyRecaptcha(body.recaptchaToken, ip))) {
    return NextResponse.json({ error: "Please check the form and try again." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set — contact form cannot send email.");
    return NextResponse.json(
      { error: "Message delivery isn't configured yet. Please call or email us directly." },
      { status: 503 },
    );
  }

  const { org, service } = await getSiteSettings();
  const resend = new Resend(apiKey);
  const to = process.env.CONTACT_TO_EMAIL || org.email;
  const from = process.env.CONTACT_FROM_EMAIL || "ESF Website <onboarding@resend.dev>";

  // Best-effort audit trail in the private "internal" Sanity dataset — fired
  // without awaiting so a Sanity outage never slows or blocks the visitor's
  // email from sending. Failure is logged, not surfaced to the client.
  const internalClient = getInternalSanityClient();
  if (internalClient) {
    internalClient
      .create({
        _type: "contactSubmission",
        name,
        email,
        phone: phone || undefined,
        message,
        submittedAt: new Date().toISOString(),
        ip,
      })
      .catch((err) => console.error("Failed to store contact submission:", err));
  }

  try {
    const notification = contactNotificationEmail({ name, email, phone, message, org });
    await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: notification.subject,
      html: notification.html,
      text: notification.text,
    });

    const autoReply = contactAutoReplyEmail({ name, org, service });
    await resend.emails.send({
      from,
      to: email,
      subject: autoReply.subject,
      html: autoReply.html,
      text: autoReply.text,
    });
  } catch (err) {
    console.error("Resend send failed:", err);
    return NextResponse.json(
      { error: "Couldn't send your message right now. Please try again shortly." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
