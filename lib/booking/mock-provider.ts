import { activities, getActivity } from "@/data/activities";
import { addBooking, makeId } from "@/lib/store";
import type { AvailabilitySlot, Booking, BookingRequest } from "@/lib/types";
import { COMMISSION_RATE, type BookingProvider } from "./provider";

const TIME_BY_PERIOD: Record<string, string> = {
  morning: "9:00 AM",
  afternoon: "1:30 PM",
  evening: "5:30 PM",
};

/** Deterministic 0-1 pseudo-random value for a given seed string, so the same
 * activity/date/time always shows the same "live" availability on refresh. */
function seededFraction(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  h ^= h << 13;
  h ^= h >>> 17;
  h ^= h << 5;
  return ((h >>> 0) % 1000) / 1000;
}

function confirmationCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "TA-";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

/**
 * Stands in for real FareHarbor/Bokun/Rezdy/Peek integrations during the MVP.
 * Availability and pricing are deterministically generated (not live), and
 * createBooking confirms instantly against the in-memory store instead of a
 * real operator's reservation system — but every method on this object is
 * exactly what a real provider adapter would implement, so swapping one in
 * later touches only this file.
 */
export const mockProvider: BookingProvider = {
  id: "mock",
  async listActivities() {
    return activities;
  },
  async getActivity(slug) {
    return getActivity(slug);
  },
  getBookingUrl(activity) {
    return `/book/${activity.slug}?via=${activity.providerId}&ref=${activity.providerActivityId}`;
  },
  async getAvailability(activitySlug, date) {
    const activity = getActivity(activitySlug);
    if (!activity) return [];

    const periods = activity.bestTimeOfDay.length > 0 ? activity.bestTimeOfDay : ["morning"];
    const slots: AvailabilitySlot[] = periods.map((period) => {
      const time = TIME_BY_PERIOD[period] ?? "10:00 AM";
      const seed = `${activitySlug}|${date}|${time}`;
      const fraction = seededFraction(seed);
      // ~1 in 6 slots reads as sold out, for realism.
      const spotsLeft = fraction < 0.16 ? 0 : Math.max(1, Math.round(fraction * 10));
      return { date, time, spotsLeft, price: activity.priceFrom };
    });

    return slots;
  },
  async createBooking(request: BookingRequest): Promise<Booking> {
    const activity = getActivity(request.activitySlug);
    if (!activity) throw new Error("Activity not found");

    const totalPrice =
      activity.priceUnit === "per person" ? activity.priceFrom * request.partySize : activity.priceFrom;

    const booking: Booking = {
      id: makeId(),
      confirmationCode: confirmationCode(),
      activitySlug: activity.slug,
      providerId: activity.providerId,
      date: request.date,
      time: request.time,
      partySize: request.partySize,
      customerName: request.customerName,
      customerEmail: request.customerEmail,
      totalPrice,
      commission: Math.round(totalPrice * COMMISSION_RATE * 100) / 100,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };

    addBooking(booking);
    return booking;
  },
};
