import type { Activity, AvailabilitySlot, Booking, BookingRequest } from "@/lib/types";

/** Standard commission take-rate assumed on every confirmed booking. */
export const COMMISSION_RATE = 0.15;

/**
 * Common interface every booking provider integration implements. Today only
 * MockProvider exists (data/activities.ts). A real integration (FareHarbor,
 * Bokun, Rezdy, Peek) implements the same shape and gets swapped in via
 * getProvider() below, no page or API route changes required.
 */
export interface BookingProvider {
  id: string;
  listActivities(): Promise<Activity[]>;
  getActivity(slug: string): Promise<Activity | undefined>;
  /** The URL a "Book Now" click should ultimately land on for this activity. */
  getBookingUrl(activity: Activity): string;
  /** Available time slots for one activity on one date. */
  getAvailability(activitySlug: string, date: string): Promise<AvailabilitySlot[]>;
  /** Confirms a booking against a chosen slot and returns the confirmation record. */
  createBooking(request: BookingRequest): Promise<Booking>;
}
