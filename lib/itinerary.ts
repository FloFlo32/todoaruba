import { activities } from "@/data/activities";
import { makeId } from "@/lib/store";
import type {
  Activity,
  Area,
  Itinerary,
  ItineraryDay,
  ResolvedItinerary,
  TripPreferences,
} from "@/lib/types";

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const ITEMS_PER_STYLE: Record<TripPreferences["tripStyle"], number> = {
  relaxed: 2,
  balanced: 3,
  packed: 4,
};

// Sequential day scheduling — no more fixed clock-time slots. Each activity's
// actual duration pushes the next one back, and a bigger gap is added when
// the next activity starts in a different part of the island, so the plan
// never asks anyone to step off one boat and straight onto the next.
const DAY_START_MIN = 9 * 60; // 9:00 AM
const LATEST_START_MIN = 22 * 60; // don't start anything after 10:00 PM

// The northwest hotel strip (Malmok → Palm Beach → Eagle Beach → Oranjestad →
// De Palm) is compact enough that a "different area" within it is still only
// a short drive. Arikok, Mangel Halto, and Baby Beach are each a real drive
// away from that strip and from each other.
const NORTHWEST_CLUSTER = new Set<Area>(["malmok", "palm-beach", "eagle-beach", "oranjestad", "de-palm"]);

/** Minutes to budget for getting from one activity's area to the next —
 * based on real relative distance on the island, not the free-text location
 * string (which is too easy to false-match on words like "beach" or "west"). */
function travelBufferMinutes(from: Area, to: Area) {
  if (from === to) return 15; // same spot, or close enough to just walk
  if (NORTHWEST_CLUSTER.has(from) && NORTHWEST_CLUSTER.has(to)) return 30; // short drive within the strip
  return 60; // a real drive across the island (Arikok, Mangel Halto, Baby Beach, island-wide tours)
}

function minutesToClock(totalMinutes: number) {
  const h24 = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

/** Lays a set of activities out across a single day in order, giving each one
 * a real start time based on the previous activity's actual end time plus a
 * travel buffer to get there. Anything that would start too late in the day
 * is dropped rather than overlapping the activity before it. */
export function scheduleDay(picks: Activity[]) {
  let cursor = DAY_START_MIN;
  let prevArea: Area | null = null;
  const scheduled: { activity: Activity; time: string }[] = [];

  for (const activity of picks) {
    const buffer = prevArea === null ? 0 : travelBufferMinutes(prevArea, activity.area);
    const start = cursor + buffer;
    if (start > LATEST_START_MIN) continue; // doesn't fit today — leave it for another day

    scheduled.push({ activity, time: minutesToClock(start) });
    cursor = start + activity.durationMinutes;
    prevArea = activity.area;
  }

  return scheduled;
}

function dayCount(preferences: TripPreferences) {
  const start = new Date(preferences.arrival);
  const end = new Date(preferences.departure);
  const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.min(Math.max(diff + 1, 1), 14);
}

function isoDate(base: string, offset: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function scoreActivity(activity: Activity, preferences: TripPreferences) {
  let score = activity.interests.filter((i) => preferences.interests.includes(i)).length * 3;
  score += activity.review.rating;
  if (preferences.children > 0 && activity.categories.includes("family")) score += 4;
  if (preferences.tripStyle === "relaxed" && activity.categories.includes("romantic")) score += 1;
  return score;
}

/** Deterministic fallback: used when OPENAI_API_KEY is missing or the model call fails. */
function ruleBasedItinerary(preferences: TripPreferences): Itinerary {
  const days = dayCount(preferences);
  const perDay = ITEMS_PER_STYLE[preferences.tripStyle];
  const pool = [...activities].sort((a, b) => scoreActivity(b, preferences) - scoreActivity(a, preferences));

  const used = new Set<string>();
  const itineraryDays: ItineraryDay[] = [];
  const timeOfDayOrder: Record<string, number> = { morning: 0, afternoon: 1, evening: 2 };

  for (let day = 0; day < days; day++) {
    const picks = [];
    for (let slot = 0; slot < perDay; slot++) {
      const pick = pool.find((a) => !used.has(a.slug)) ?? pool[(day * perDay + slot) % pool.length];
      if (!pick) continue;
      used.add(pick.slug);
      picks.push(pick);
    }
    picks.sort((a, b) => timeOfDayOrder[a.bestTimeOfDay[0]] - timeOfDayOrder[b.bestTimeOfDay[0]]);

    const scheduled = scheduleDay(picks);
    // Anything that didn't fit today goes back in the pool for a later day
    // instead of being wasted.
    const scheduledSlugs = new Set(scheduled.map((s) => s.activity.slug));
    for (const pick of picks) if (!scheduledSlugs.has(pick.slug)) used.delete(pick.slug);

    const items: ItineraryDay["items"] = scheduled.map(({ activity, time }) => ({
      activitySlug: activity.slug,
      time,
      why: `Matches your interest in ${activity.interests.find((i) => preferences.interests.includes(i)) ?? "a great Aruba day"}.`,
    }));

    itineraryDays.push({
      dayNumber: day + 1,
      date: isoDate(preferences.arrival, day),
      theme: itineraryDays.length === 0 ? "Arrival & first taste of the island" : `Day ${day + 1}`,
      items,
    });
  }

  return finalize(preferences, itineraryDays);
}

function finalize(preferences: TripPreferences, days: ItineraryDay[]): Itinerary {
  const bySlug = new Map(activities.map((a) => [a.slug, a] as const));
  const totalEstimate = days
    .flatMap((d) => d.items)
    .reduce((sum, item) => sum + (bySlug.get(item.activitySlug)?.priceFrom ?? 0), 0);

  return {
    id: makeId(),
    createdAt: new Date().toISOString(),
    preferences,
    days,
    totalEstimate,
  };
}

interface AiDayItem {
  activitySlug: string;
  why: string;
}
interface AiDay {
  dayNumber: number;
  theme: string;
  items: AiDayItem[];
}

async function aiItinerary(preferences: TripPreferences): Promise<Itinerary | null> {
  if (!process.env.OPENAI_API_KEY) return null;

  const days = dayCount(preferences);
  const perDay = ITEMS_PER_STYLE[preferences.tripStyle];
  const catalog = activities.map((a) => ({
    slug: a.slug,
    name: a.name,
    categories: a.categories,
    interests: a.interests,
    priceFrom: a.priceFrom,
    priceUnit: a.priceUnit,
    durationMinutes: a.durationMinutes,
    bestTimeOfDay: a.bestTimeOfDay,
    area: a.area,
    shortDescription: a.shortDescription,
    rating: a.review.rating,
  }));

  const system = [
    "You are the trip-planning engine for ToDo Aruba, an Aruba activities marketplace.",
    "Build a day-by-day Aruba itinerary using ONLY the activities in the catalog below (reference them by exact `slug`). Never invent an activity or slug.",
    `Trip length: ${days} day(s). Aim for about ${perDay} activities per day (fewer on arrival/departure days, and for a "relaxed" style).`,
    "Respect the traveler's interests, budget, trip style, and whether they're traveling with children (prefer `family` category activities when children > 0).",
    "Vary activities across days, don't repeat the same slug unless the trip is long and the catalog is exhausted.",
    "Do NOT assign clock times yourself — the system computes real start times automatically from each activity's actual `durationMinutes` plus travel time between `area`s, so nothing overlaps. Your only job is WHICH activities and in what ORDER within the day (morning-appropriate ones first).",
    "Favor keeping a day's activities in the same `area` or in nearby areas (the northwest strip: malmok, palm-beach, eagle-beach, oranjestad, de-palm, are all close together). Avoid bouncing between a far-flung area (arikok, mangel-halto, baby-beach) and the northwest strip more than once in the same day — that's a real drive each way.",
    "Write a one-sentence `why` for each item, in a warm, concrete voice, explaining why it fits THIS traveler (their interests/notes), no filler phrases.",
    "Give each day a short 3-6 word `theme` describing its character (e.g. \"Reef & Sunset\").",
    "Reply with ONLY valid JSON: { \"days\": [ { \"dayNumber\": number, \"theme\": string, \"items\": [ { \"activitySlug\": string, \"why\": string } ] } ] } — items in chronological order, no `time` field.",
    "",
    `=== CATALOG (${catalog.length} activities) ===`,
    JSON.stringify(catalog),
  ].join("\n");

  const user = [
    `Arrival: ${preferences.arrival}. Departure: ${preferences.departure}.`,
    `Travelers: ${preferences.adults} adult(s), ${preferences.children} child(ren).`,
    `Interests: ${preferences.interests.join(", ") || "open to anything"}.`,
    `Activities budget: about $${preferences.budget} total for the trip.`,
    `Trip style: ${preferences.tripStyle}.`,
    preferences.notes ? `What would make this trip amazing: ${preferences.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.6,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) return null;

    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content;
    if (!raw) return null;

    const parsed = JSON.parse(raw) as { days?: AiDay[] };
    if (!Array.isArray(parsed.days) || parsed.days.length === 0) return null;

    const bySlug = new Map(activities.map((a) => [a.slug, a] as const));
    const cleanDays: ItineraryDay[] = parsed.days.slice(0, days).map((d, i) => {
      const validItems = (d.items || []).filter((item) => bySlug.has(item.activitySlug));
      const whyBySlug = new Map(validItems.map((item) => [item.activitySlug, item.why] as const));
      // The AI only picks WHICH activities and their order — we're the ones
      // who compute real, non-overlapping start times from that order.
      const scheduled = scheduleDay(validItems.map((item) => bySlug.get(item.activitySlug)!));

      return {
        dayNumber: i + 1,
        date: isoDate(preferences.arrival, i),
        theme: d.theme || `Day ${i + 1}`,
        items: scheduled.map(({ activity, time }) => ({
          activitySlug: activity.slug,
          time,
          why: whyBySlug.get(activity.slug) || "A great fit for your trip.",
        })),
      };
    });

    const hasAnyItems = cleanDays.some((d) => d.items.length > 0);
    if (!hasAnyItems) return null;

    return finalize(preferences, cleanDays);
  } catch {
    return null;
  }
}

export async function generateItinerary(preferences: TripPreferences): Promise<Itinerary> {
  const ai = await aiItinerary(preferences);
  return ai ?? ruleBasedItinerary(preferences);
}

export function resolveItinerary(itinerary: Itinerary): ResolvedItinerary {
  const bySlug = new Map(activities.map((a) => [a.slug, a] as const));
  return {
    ...itinerary,
    days: itinerary.days.map((day) => ({
      ...day,
      items: day.items
        .filter((item) => bySlug.has(item.activitySlug))
        .map((item) => ({ ...item, activity: bySlug.get(item.activitySlug)! })),
    })),
  };
}

/** Re-plan a single day leaning more relaxed or more adventurous, using the same catalog. */
export function adjustDay(
  day: ItineraryDay,
  preferences: TripPreferences,
  direction: "relaxing" | "adventurous"
): ItineraryDay {
  const targetCategories: Activity["categories"] =
    direction === "relaxing"
      ? ["romantic", "food-dining", "nature"]
      : ["adventure", "water-activities", "diving"];

  const usedElsewhere = new Set<string>();
  const currentSlugs = new Set(day.items.map((i) => i.activitySlug));

  const pool = activities
    .filter((a) => !usedElsewhere.has(a.slug))
    .sort((a, b) => {
      const aMatch = a.categories.some((c) => targetCategories.includes(c)) ? 1 : 0;
      const bMatch = b.categories.some((c) => targetCategories.includes(c)) ? 1 : 0;
      if (aMatch !== bMatch) return bMatch - aMatch;
      return scoreActivity(b, preferences) - scoreActivity(a, preferences);
    });

  const items = day.items.map((item) => {
    const replacement = pool.find((a) => !currentSlugs.has(a.slug) && a.slug !== item.activitySlug);
    if (!replacement) return item;
    currentSlugs.delete(item.activitySlug);
    currentSlugs.add(replacement.slug);
    return {
      activitySlug: replacement.slug,
      time: item.time,
      why:
        direction === "relaxing"
          ? "Swapped in for an easier, slower-paced day."
          : "Swapped in to add more energy to the day.",
    };
  });

  // Swapped-in activities can run longer or shorter than what they replaced,
  // so re-lay out the whole day rather than keeping the old (now possibly
  // overlapping) clock times.
  const bySlug = new Map(activities.map((a) => [a.slug, a] as const));
  const orderedActivities = items
    .map((item) => bySlug.get(item.activitySlug))
    .filter((a): a is Activity => !!a);
  const scheduled = scheduleDay(orderedActivities);

  const rescheduledItems: ItineraryDay["items"] = scheduled.map(({ activity, time }) => {
    const original = items.find((i) => i.activitySlug === activity.slug);
    return {
      activitySlug: activity.slug,
      time,
      why: original?.why ?? "A great fit for your day.",
    };
  });

  return { ...day, items: rescheduledItems };
}
