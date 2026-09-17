import type { SiteSettings } from "@/lib/sanity/queries";

type Org = SiteSettings["org"];
type Service = SiteSettings["service"];

/**
 * User-supplied values land inside HTML sent to a real inbox — escape them
 * so a message body can't break the layout or spoof markup in the
 * recipient's mail client.
 */
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const PRIMARY = "#4936c2";
const ACCENT = "#d97a06";
const ON_PRIMARY = "#ffffff";
const TEXT = "#1f1b2e";
const MUTED = "#6b6478";
const BORDER = "#e6e2f0";
const SURFACE = "#f7f6fb";

/**
 * Shared header/footer chrome for both contact-form emails — an inline,
 * table-based recreation of the site's CSS "ESF" badge (components/footer.tsx),
 * since no logo image exists in Sanity and email clients can't reach
 * relative/CSS-variable assets anyway. Table layout + inline styles only,
 * so it survives Gmail/Outlook/Apple Mail's CSS stripping.
 */
function emailShell(bodyHtml: string, org: Org) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:${SURFACE};font-family:Segoe UI,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${SURFACE};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid ${BORDER};">
            <tr>
              <td style="padding:28px 32px;border-bottom:1px solid ${BORDER};">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="background-color:${PRIMARY};background-image:linear-gradient(100deg, ${PRIMARY}, ${ACCENT} 65%);border-radius:10px;width:40px;height:40px;text-align:center;vertical-align:middle;">
                      <span style="display:inline-block;line-height:40px;color:${ON_PRIMARY};font-weight:700;font-size:14px;">ESF</span>
                    </td>
                    <td style="padding-left:12px;font-size:16px;font-weight:600;color:${TEXT};">
                      ${escapeHtml(org.name)}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;color:${TEXT};font-size:15px;line-height:1.6;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background:${SURFACE};border-top:1px solid ${BORDER};font-size:12px;color:${MUTED};line-height:1.6;">
                ${escapeHtml(org.name)} &middot; ${escapeHtml(org.address ?? "")}<br/>
                ${escapeHtml(org.phone ?? "")} &middot; ${escapeHtml(org.email ?? "")}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function contactNotificationEmail(input: {
  name: string;
  email: string;
  phone?: string;
  message: string;
  org: Org;
}) {
  const { name, email, phone, message, org } = input;
  const subject = `New contact form message from ${name}`;

  const rows = [
    ["Name", name],
    ["Email", email],
    ...(phone ? [["Phone", phone]] : []),
  ]
    .map(
      ([label, value]) => `<tr>
        <td style="padding:4px 12px 4px 0;color:${MUTED};font-size:13px;white-space:nowrap;vertical-align:top;">${label}</td>
        <td style="padding:4px 0;font-size:14px;color:${TEXT};">${escapeHtml(value)}</td>
      </tr>`,
    )
    .join("");

  const html = emailShell(
    `<h1 style="margin:0 0 16px;font-size:18px;font-weight:600;color:${TEXT};">New message from your website</h1>
     <p style="margin:0 0 20px;color:${MUTED};font-size:13px;">Sent via the esfworld.us contact form.</p>
     <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">${rows}</table>
     <div style="padding:16px;background:${SURFACE};border:1px solid ${BORDER};border-radius:10px;white-space:pre-wrap;font-size:14px;line-height:1.6;">${escapeHtml(message)}</div>
     <p style="margin:20px 0 0;color:${MUTED};font-size:13px;">Replying to this email goes directly to ${escapeHtml(name)} (${escapeHtml(email)}).</p>`,
    org,
  );

  const text = [
    `New message from your website`,
    ``,
    `Name: ${name}`,
    `Email: ${email}`,
    phone && `Phone: ${phone}`,
    ``,
    message,
    ``,
    `Replying to this email goes directly to ${name} (${email}).`,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text };
}

export function contactAutoReplyEmail(input: { name: string; org: Org; service: Service }) {
  const { name, org, service } = input;
  const subject = `We got your message — ${org.shortName}`;

  const serviceLine =
    service?.day && service?.time
      ? `<p style="margin:0 0 20px;">If you'd like to stop by in person, we'd love to see you — we gather ${escapeHtml(
          service.day,
        )}s at ${escapeHtml(service.time)}${service.note ? `, ${escapeHtml(service.note)}` : ""}.</p>`
      : "";

  const html = emailShell(
    `<p style="margin:0 0 16px;">Hi ${escapeHtml(name)},</p>
     <p style="margin:0 0 16px;">Thanks so much for reaching out — we're glad you did! Your message has been passed along to our team, and someone will get back to you soon.</p>
     ${serviceLine}
     <p style="margin:0 0 4px;">Talk soon,</p>
     <p style="margin:0 0 20px;font-weight:600;">${escapeHtml(org.shortName)} Team</p>
     <table role="presentation" cellpadding="0" cellspacing="0" style="border-top:1px solid ${BORDER};padding-top:16px;font-size:13px;color:${MUTED};">
       <tr><td style="padding:2px 0;">${escapeHtml(org.name)}</td></tr>
       <tr><td style="padding:2px 0;">${escapeHtml(org.phone ?? "")}</td></tr>
       <tr><td style="padding:2px 0;">${escapeHtml(org.email ?? "")}</td></tr>
       <tr><td style="padding:2px 0;">${escapeHtml(org.address ?? "")}</td></tr>
     </table>`,
    org,
  );

  const text = [
    `Hi ${name},`,
    ``,
    `Thanks so much for reaching out — we're glad you did! Your message has been passed along to our team, and someone will get back to you soon.`,
    service?.day && service?.time
      ? `\nIf you'd like to stop by in person, we'd love to see you — we gather ${service.day}s at ${service.time}${service.note ? `, ${service.note}` : ""}.`
      : "",
    ``,
    `Talk soon,`,
    `${org.shortName} Team`,
    ``,
    org.name,
    org.phone,
    org.email,
    org.address,
  ]
    .filter((line) => line !== undefined && line !== "")
    .join("\n");

  return { subject, html, text };
}
