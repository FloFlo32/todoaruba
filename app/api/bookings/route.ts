import { getProvider } from "@/lib/booking";
import type { BookingRequest } from "@/lib/types";

export const runtime = "nodejs";

function isValid(body: unknown): body is BookingRequest {
  const b = body as Partial<BookingRequest> | null;
  return !!(
    b &&
    typeof b.activitySlug === "string" &&
    typeof b.date === "string" &&
    typeof b.time === "string" &&
    typeof b.partySize === "number" &&
    b.partySize >= 1 &&
    typeof b.customerName === "string" &&
    b.customerName.trim().length > 0 &&
    typeof b.customerEmail === "string" &&
    b.customerEmail.includes("@")
  );
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!isValid(body)) {
    return Response.json({ error: "Missing or invalid booking details." }, { status: 400 });
  }

  const provider = getProvider();
  const activity = await provider.getActivity(body.activitySlug);
  if (!activity) {
    return Response.json({ error: "Activity not found." }, { status: 404 });
  }

  const booking = await provider.createBooking({
    activitySlug: body.activitySlug,
    date: body.date,
    time: body.time,
    partySize: body.partySize,
    customerName: body.customerName.slice(0, 200),
    customerEmail: body.customerEmail.slice(0, 200),
  });

  return Response.json({ booking });
}
