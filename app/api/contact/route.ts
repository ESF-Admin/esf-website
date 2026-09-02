import { NextResponse } from "next/server";
import { Resend } from "resend";
import { org } from "@/lib/content";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// ponytail: in-memory rate limit — resets on cold start and isn't shared
// across serverless instances, so it's a soft "slow down a bot on this
// instance" guard, not a hard cap. Upgrade to Vercel KV/Upstash if abuse
// becomes real (needs multi-instance shared state to be exact).
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

type Body = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
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

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  const message = body.message?.trim() ?? "";

  if (!name || !EMAIL.test(email) || message.length < 10) {
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

  const resend = new Resend(apiKey);
  const to = process.env.CONTACT_TO_EMAIL || org.email;
  const from = process.env.CONTACT_FROM_EMAIL || "ESF Website <onboarding@resend.dev>";

  try {
    await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `New contact form message from ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        phone && `Phone: ${phone}`,
        "",
        message,
      ]
        .filter(Boolean)
        .join("\n"),
    });

    await resend.emails.send({
      from,
      to: email,
      subject: "We received your message — ESF",
      text: `Hi ${name},\n\nThanks for reaching out to ${org.name}. We received your message and will be in touch soon.\n\n${org.name}`,
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
