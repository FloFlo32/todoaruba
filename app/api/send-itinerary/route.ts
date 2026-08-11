import { brand } from "@/brand.config";
import { resolveItinerary } from "@/lib/itinerary";
import { getItinerary, addLead } from "@/lib/store";
import { getProvider } from "@/lib/booking";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function renderEmailHtml(origin: string, itinerary: ReturnType<typeof resolveItinerary>) {
  const provider = getProvider();
  const days = itinerary.days
    .map(
      (day) => `
        <tr><td style="padding:24px 0 8px;font:600 13px/1.4 monospace;letter-spacing:.06em;text-transform:uppercase;color:#0f766e;">
          Day ${day.dayNumber} &middot; ${day.theme}
        </td></tr>
        ${day.items
          .map(
            (item) => `
          <tr>
            <td style="padding:12px 0;border-top:1px solid #e5e7eb;">
              <div style="font:600 15px/1.3 sans-serif;color:#111827;">${item.time} &mdash; ${item.activity.name}</div>
              <div style="font:400 13px/1.5 sans-serif;color:#6b7280;margin-top:4px;">${item.why}</div>
              <div style="font:400 13px/1.5 sans-serif;color:#374151;margin-top:6px;">
                From $${item.activity.priceFrom} ${item.activity.priceUnit} &middot; ${item.activity.location}
              </div>
              <a href="${origin}${provider.getBookingUrl(item.activity)}"
                 style="display:inline-block;margin-top:8px;padding:8px 16px;background:#0f766e;color:#fff;text-decoration:none;border-radius:8px;font:600 13px sans-serif;">
                Book Now
              </a>
            </td>
          </tr>`
          )
          .join("")}
      `
    )
    .join("");

  return `
  <div style="max-width:560px;margin:0 auto;font-family:sans-serif;">
    <h1 style="font:700 24px/1.3 sans-serif;color:#111827;">Your Aruba itinerary is ready.</h1>
    <p style="font:400 15px/1.5 sans-serif;color:#374151;">
      Estimated activities budget: <strong>$${itinerary.totalEstimate}</strong> for
      ${itinerary.preferences.adults} adult(s)${itinerary.preferences.children ? `, ${itinerary.preferences.children} child(ren)` : ""}.
    </p>
    <table role="presentation" width="100%">${days}</table>
    <p style="margin-top:28px;font:400 13px/1.5 sans-serif;color:#9ca3af;">
      Sent by ${brand.name}. <a href="${origin}/trip/${itinerary.id}" style="color:#0f766e;">View this itinerary online</a>.
    </p>
  </div>`;
}

export async function POST(req: Request) {
  let body: { itineraryId?: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { itineraryId, email } = body;
  if (!itineraryId || !email || !EMAIL_RE.test(email)) {
    return Response.json({ error: "A valid email and itinerary are required." }, { status: 400 });
  }

  const itinerary = getItinerary(itineraryId);
  if (!itinerary) return Response.json({ error: "Itinerary not found." }, { status: 404 });

  addLead(email, itineraryId);

  if (!process.env.RESEND_API_KEY) {
    return Response.json({ emailed: false, reason: "RESEND_API_KEY not configured yet. Lead saved." });
  }

  const origin = new URL(req.url).origin;
  const resolved = resolveItinerary(itinerary);
  const from = process.env.RESEND_FROM_EMAIL || "ToDo Aruba <onboarding@resend.dev>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: "Your Aruba itinerary is ready",
        html: renderEmailHtml(origin, resolved),
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return Response.json({ emailed: false, reason: detail.slice(0, 300) });
    }
    return Response.json({ emailed: true });
  } catch {
    return Response.json({ emailed: false, reason: "Email provider unreachable." });
  }
}
