import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

/**
 * Sanity publish webhook. Configure in the Sanity project dashboard:
 * Settings → API → Webhooks → POST to this route's deployed URL,
 * filter `_type == "bulletin"`, secret = SANITY_REVALIDATE_SECRET.
 */
export async function POST(req: NextRequest) {
  try {
    const { isValidSignature, body } = await parseBody<{ _type?: string }>(
      req,
      process.env.SANITY_REVALIDATE_SECRET,
    );

    if (!isValidSignature) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
    }

    if (!body?._type) {
      return NextResponse.json({ message: "Bad request" }, { status: 400 });
    }

    revalidateTag(body._type, "max");

    return NextResponse.json({ revalidated: true, type: body._type, now: Date.now() });
  } catch (err) {
    // Log the real error server-side only — the response body is public
    // (no auth required to see it, since a malformed/unsigned request
    // reaches this catch before signature verification can run), so it
    // must never carry internal error details (stack traces, library
    // internals, file paths).
    console.error("[revalidate] webhook error", err);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
