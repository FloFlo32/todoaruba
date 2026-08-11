"use client";

import * as React from "react";
import { ItineraryView } from "@/components/planner/itinerary-view";
import type { ResolvedItinerary } from "@/lib/types";

export function TripPageClient({ itinerary }: { itinerary: ResolvedItinerary }) {
  const [current, setCurrent] = React.useState(itinerary);
  return <ItineraryView itinerary={current} onUpdate={setCurrent} />;
}
