export type Interest =
  | "beaches"
  | "snorkeling"
  | "diving"
  | "adventure"
  | "atv"
  | "water-sports"
  | "sailing"
  | "sunset-cruises"
  | "food"
  | "nightlife"
  | "family"
  | "romance"
  | "culture"
  | "nature"
  | "relaxation";

export type CategorySlug =
  | "water-activities"
  | "adventure"
  | "boat-tours"
  | "snorkeling"
  | "diving"
  | "food-dining"
  | "family"
  | "romantic"
  | "nightlife"
  | "nature"
  | "cultural-experiences";

export interface Category {
  slug: CategorySlug;
  name: string;
  /** SEO-facing plural/search phrasing, e.g. "Aruba Snorkeling Tours" */
  seoTitle: string;
  description: string;
  icon: string; // lucide-react icon name
}

export type TimeOfDay = "morning" | "afternoon" | "evening";

export interface Review {
  rating: number; // 0-5
  count: number;
}

export type Area =
  | "malmok"
  | "palm-beach"
  | "eagle-beach"
  | "oranjestad"
  | "de-palm"
  | "arikok"
  | "mangel-halto"
  | "baby-beach"
  | "island-wide";

export interface Activity {
  slug: string;
  name: string;
  categories: CategorySlug[];
  interests: Interest[];
  images: string[];
  shortDescription: string;
  description: string;
  durationMinutes: number;
  location: string;
  /** Real island region this activity departs/happens from, used to estimate
   * travel time to whatever's scheduled next — NOT for display. */
  area: Area;
  meetingPoint: string;
  priceFrom: number;
  priceUnit: "per person" | "per group" | "per couple";
  bestTimeOfDay: TimeOfDay[];
  included: string[];
  excluded: string[];
  cancellationPolicy: string;
  review: Review;
  /** Which mock "provider" this listing simulates, for booking-architecture realism. */
  providerId: "fareharbor" | "bokun" | "rezdy" | "peek";
  providerActivityId: string;
  featured?: boolean;
}

export interface TripPreferences {
  arrival: string; // ISO date
  departure: string; // ISO date
  adults: number;
  children: number;
  interests: Interest[];
  budget: number; // total activities budget, USD
  tripStyle: "relaxed" | "balanced" | "packed";
  notes?: string;
}

export interface ItineraryItem {
  activitySlug: string;
  time: string; // e.g. "9:00 AM"
  why: string;
}

export interface ItineraryDay {
  dayNumber: number;
  date: string; // ISO date
  theme: string;
  items: ItineraryItem[];
}

export interface Itinerary {
  id: string;
  createdAt: string;
  preferences: TripPreferences;
  days: ItineraryDay[];
  totalEstimate: number;
}

export interface AvailabilitySlot {
  date: string; // ISO date
  time: string; // e.g. "9:00 AM"
  spotsLeft: number;
  price: number;
}

export interface BookingRequest {
  activitySlug: string;
  date: string; // ISO date
  time: string;
  partySize: number;
  customerName: string;
  customerEmail: string;
}

export interface Booking {
  id: string;
  confirmationCode: string;
  activitySlug: string;
  providerId: Activity["providerId"];
  date: string;
  time: string;
  partySize: number;
  customerName: string;
  customerEmail: string;
  totalPrice: number;
  commission: number;
  status: "confirmed";
  createdAt: string;
}

/** Itinerary with activity objects resolved, for rendering. */
export interface ResolvedItineraryItem extends ItineraryItem {
  activity: Activity;
}

export interface ResolvedItineraryDay extends Omit<ItineraryDay, "items"> {
  items: ResolvedItineraryItem[];
}

export interface ResolvedItinerary extends Omit<Itinerary, "days"> {
  days: ResolvedItineraryDay[];
}
