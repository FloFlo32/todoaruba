import { adjustDay, resolveItinerary, scheduleDay } from "@/lib/itinerary";
import { getItinerary, saveItinerary } from "@/lib/store";
import { activities } from "@/data/activities";
import type { ItineraryDay } from "@/lib/types";

export const runtime = "nodejs";

const bySlug = new Map(activities.map((a) => [a.slug, a] as const));

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const itinerary = getItinerary(id);
  if (!itinerary) return Response.json({ error: "Itinerary not found." }, { status: 404 });
  return Response.json({ itinerary: resolveItinerary(itinerary) });
}

function recomputeTotal(days: ItineraryDay[]) {
  return days
    .flatMap((d) => d.items)
    .reduce((sum, item) => sum + (bySlug.get(item.activitySlug)?.priceFrom ?? 0), 0);
}

/** Any client-side edit (add/replace/remove/move/reorder) can only ever change
 * WHICH activities are on a day or what order they're in — never trust a
 * client-supplied `time`. Always re-lay out the day server-side so edits
 * can't reintroduce overlapping or back-to-back-across-the-island times. */
function rescheduleDays(days: ItineraryDay[]): ItineraryDay[] {
  return days.map((day) => {
    const withActivity = day.items
      .map((item) => ({ item, activity: bySlug.get(item.activitySlug) }))
      .filter((x): x is { item: (typeof day.items)[number]; activity: NonNullable<typeof x.activity> } => !!x.activity);
    const whyBySlug = new Map(withActivity.map(({ item, activity }) => [activity.slug, item.why] as const));
    const scheduled = scheduleDay(withActivity.map((x) => x.activity));
    return {
      ...day,
      items: scheduled.map(({ activity, time }) => ({
        activitySlug: activity.slug,
        time,
        why: whyBySlug.get(activity.slug) ?? "",
      })),
    };
  });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const itinerary = getItinerary(id);
  if (!itinerary) return Response.json({ error: "Itinerary not found." }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const b = body as { type?: string; days?: ItineraryDay[]; dayNumber?: number; direction?: "relaxing" | "adventurous" };

  if (b.type === "replace-days" && Array.isArray(b.days)) {
    itinerary.days = rescheduleDays(b.days);
  } else if (b.type === "adjust-day" && typeof b.dayNumber === "number" && b.direction) {
    itinerary.days = itinerary.days.map((day) =>
      day.dayNumber === b.dayNumber ? adjustDay(day, itinerary.preferences, b.direction!) : day
    );
  } else {
    return Response.json({ error: "Unsupported edit." }, { status: 400 });
  }

  itinerary.totalEstimate = recomputeTotal(itinerary.days);
  saveItinerary(itinerary);

  return Response.json({ itinerary: resolveItinerary(itinerary) });
}
