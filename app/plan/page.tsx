import type { Metadata } from "next";
import { TripWizard } from "@/components/planner/trip-wizard";

export const metadata: Metadata = {
  title: "Plan My Trip",
  description: "Answer a few quick questions and we'll build your personalized Aruba itinerary.",
};

export default function PlanPage() {
  return (
    <main className="flex-1">
      <TripWizard />
    </main>
  );
}
