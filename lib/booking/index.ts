import { mockProvider } from "./mock-provider";
import type { BookingProvider } from "./provider";

/**
 * Single switch point for going live with a real inventory provider.
 * Set BOOKING_PROVIDER=fareharbor (etc.) once that integration exists and
 * add the branch here; every page/route calls getProvider(), never a
 * specific provider module directly.
 */
export function getProvider(): BookingProvider {
  return mockProvider;
}

export type { BookingProvider } from "./provider";
