"use client";

import * as React from "react";
import Link from "next/link";
import {
  CalendarDays,
  Users,
  Clock,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Activity, AvailabilitySlot, Booking } from "@/lib/types";

const PROVIDER_NAMES: Record<string, string> = {
  fareharbor: "FareHarbor",
  bokun: "Bokun",
  rezdy: "Rezdy",
  peek: "Peek Pro",
};

function todayPlus(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatDateLabel(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

export function BookingFlow({ activity }: { activity: Activity }) {
  const providerName = PROVIDER_NAMES[activity.providerId] ?? "our booking partner";
  const [date, setDate] = React.useState(() => todayPlus(1));
  const [partySize, setPartySize] = React.useState(2);
  const [slots, setSlots] = React.useState<AvailabilitySlot[]>([]);
  const [loadingSlots, setLoadingSlots] = React.useState(true);
  const [selectedTime, setSelectedTime] = React.useState<string | null>(null);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [confirming, setConfirming] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [booking, setBooking] = React.useState<Booking | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setLoadingSlots(true);
    setSelectedTime(null);
    fetch(`/api/availability?slug=${activity.slug}&date=${date}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setSlots(data.slots ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activity.slug, date]);

  const totalPrice =
    activity.priceUnit === "per person" ? activity.priceFrom * partySize : activity.priceFrom;

  async function handleConfirm() {
    if (!selectedTime || !name.trim() || !email.includes("@")) return;
    setConfirming(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activitySlug: activity.slug,
          date,
          time: selectedTime,
          partySize,
          customerName: name,
          customerEmail: email,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setBooking(data.booking as Booking);
    } catch {
      setError("Something went wrong confirming your booking. Please try again.");
    } finally {
      setConfirming(false);
    }
  }

  if (booking) {
    return (
      <div className="container-px mx-auto max-w-xl py-20 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
          <CheckCircle2 className="size-6" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-bold sm:text-3xl">Booking confirmed!</h1>
        <p className="mt-3 text-muted-foreground">
          Confirmation <span className="font-mono font-semibold text-foreground">{booking.confirmationCode}</span> for{" "}
          {activity.name}. We&apos;ve sent the details to {booking.customerEmail}.
        </p>
        <div className="mt-8 space-y-2.5 rounded-2xl border border-border bg-card p-5 text-left text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date</span>
            <span className="font-medium">{formatDateLabel(booking.date)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Time</span>
            <span className="font-medium">{booking.time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Party size</span>
            <span className="font-medium">{booking.partySize}</span>
          </div>
          <div className="flex justify-between border-t border-border/60 pt-2.5">
            <span className="text-muted-foreground">Total paid</span>
            <span className="font-semibold text-foreground">${booking.totalPrice.toFixed(2)}</span>
          </div>
        </div>
        <Button asChild variant="outline" className="mt-8">
          <Link href="/things-to-do">
            <ArrowLeft className="size-4" /> Browse more activities
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-px mx-auto max-w-3xl py-14 sm:py-20">
      <Link
        href={`/activity/${activity.slug}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to activity details
      </Link>

      <h1 className="mt-4 text-balance font-display text-2xl font-bold sm:text-3xl">
        Book {activity.name}
      </h1>
      <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
        <ShieldCheck className="size-4 shrink-0" /> Fulfilled by {providerName}. Availability and
        pricing shown here come directly from their reservation system.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <div>
            <label htmlFor="date" className="mb-2 flex items-center gap-1.5 text-sm font-medium">
              <CalendarDays className="size-4" /> Date
            </label>
            <Input
              id="date"
              type="date"
              min={todayPlus(0)}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="max-w-xs"
            />
          </div>

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-sm font-medium">
              <Clock className="size-4" /> Available times
            </p>
            {loadingSlots ? (
              <p className="text-sm text-muted-foreground">Checking availability...</p>
            ) : slots.length === 0 ? (
              <p className="text-sm text-muted-foreground">No times available on this date.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {slots.map((slot) => {
                  const soldOut = slot.spotsLeft === 0;
                  const selected = selectedTime === slot.time;
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={soldOut}
                      onClick={() => setSelectedTime(slot.time)}
                      className={`rounded-lg border px-4 py-2.5 text-left text-sm transition-colors ${
                        soldOut
                          ? "cursor-not-allowed border-border/50 text-muted-foreground/50"
                          : selected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/40"
                      }`}
                    >
                      <span className="block font-medium">{slot.time}</span>
                      <span className="block text-xs">
                        {soldOut ? "Sold out" : `${slot.spotsLeft} spot${slot.spotsLeft === 1 ? "" : "s"} left`}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="partySize" className="mb-2 flex items-center gap-1.5 text-sm font-medium">
              <Users className="size-4" /> Party size
            </label>
            <Input
              id="partySize"
              type="number"
              min={1}
              max={12}
              value={partySize}
              onChange={(e) => setPartySize(Math.max(1, Math.min(12, Number(e.target.value) || 1)))}
              className="max-w-24"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium">
                Full name
              </label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
            </div>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <div className="sticky top-24 h-fit rounded-2xl border border-border bg-card p-5">
          <p className="font-semibold">{activity.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">{activity.location}</p>
          <div className="mt-4 space-y-1.5 border-t border-border/60 pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                ${activity.priceFrom} &times; {activity.priceUnit === "per person" ? `${partySize} guests` : "flat rate"}
              </span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-border/60 pt-1.5 font-semibold text-foreground">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>
          {selectedTime && (
            <Badge variant="secondary" className="mt-3 w-fit">
              {formatDateLabel(date)} &middot; {selectedTime}
            </Badge>
          )}
          <Button
            size="lg"
            className="mt-4 w-full"
            disabled={!selectedTime || !name.trim() || !email.includes("@") || confirming}
            onClick={handleConfirm}
          >
            {confirming ? <Loader2 className="size-4 animate-spin" /> : "Confirm Booking"}
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">{activity.cancellationPolicy}</p>
        </div>
      </div>
    </div>
  );
}
