import { generateItinerary, resolveItinerary } from "@/lib/itinerary";
import { saveItinerary } from "@/lib/store";
import type { Interest, TripPreferences } from "@/lib/types";

export const runtime = "nodejs";

function isValid(body: unknown): body is TripPreferences {
  const b = body as Partial<TripPreferences> | null;
  return !!(
    b &&
    typeof b.arrival === "string" &&
    typeof b.departure === "string" &&
    typeof b.adults === "number" &&
    b.adults >= 1 &&
    Array.isArray(b.interests) &&
    typeof b.budget === "number" &&
    ["relaxed", "balanced", "packed"].includes(b.tripStyle as string)
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
    return Response.json({ error: "Missing or invalid trip preferences." }, { status: 400 });
  }

  const preferences: TripPreferences = {
    arrival: body.arrival,
    departure: body.departure,
    adults: body.adults,
    children: body.children ?? 0,
    interests: body.interests as Interest[],
    budget: body.budget,
    tripStyle: body.tripStyle,
    notes: body.notes?.slice(0, 600),
  };

  const itinerary = await generateItinerary(preferences);
  saveItinerary(itinerary);

  return Response.json({ itinerary: resolveItinerary(itinerary) });
}
