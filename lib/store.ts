import type { Booking, Itinerary } from "@/lib/types";

/**
 * In-memory data store for the MVP: generated itineraries, email leads, and
 * booking-referral clicks (for the admin dashboard + commission tracking).
 *
 * This resets on server restart/redeploy. It exists so the admin dashboard
 * has real data to show without standing up a database for the first
 * version. Swap for Postgres/Supabase once this needs to survive restarts
 * or run across multiple instances — every read/write goes through the
 * functions below, so that swap touches only this file.
 */

export interface Lead {
  id: string;
  email: string;
  itineraryId: string;
  createdAt: string;
}

export interface ClickEvent {
  id: string;
  activitySlug: string;
  providerId: string;
  providerActivityId: string;
  priceFrom: number;
  createdAt: string;
}

interface Store {
  itineraries: Map<string, Itinerary>;
  leads: Lead[];
  clicks: ClickEvent[];
  bookings: Booking[];
}

const globalForStore = globalThis as unknown as { __todoArubaStore?: Store };

const store: Store =
  globalForStore.__todoArubaStore ??
  (globalForStore.__todoArubaStore = {
    itineraries: new Map(),
    leads: [],
    clicks: [],
    bookings: [],
  });

// Defensive backfill for the dev-server hot-reload case, where globalThis
// keeps an already-created store from before this field existed.
if (!store.bookings) store.bookings = [];

function makeId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function saveItinerary(itinerary: Itinerary) {
  store.itineraries.set(itinerary.id, itinerary);
}

export function getItinerary(id: string) {
  return store.itineraries.get(id);
}

export function listItineraries() {
  return [...store.itineraries.values()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function addLead(email: string, itineraryId: string) {
  const lead: Lead = { id: makeId(), email, itineraryId, createdAt: new Date().toISOString() };
  store.leads.push(lead);
  return lead;
}

export function listLeads() {
  return [...store.leads].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function addClick(event: Omit<ClickEvent, "id" | "createdAt">) {
  const click: ClickEvent = { ...event, id: makeId(), createdAt: new Date().toISOString() };
  store.clicks.push(click);
  return click;
}

export function listClicks() {
  return [...store.clicks].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function addBooking(booking: Booking) {
  store.bookings.push(booking);
  return booking;
}

export function listBookings() {
  return [...store.bookings].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export { makeId };
