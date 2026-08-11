"use client";

import * as React from "react";
import Link from "next/link";
import { Mail, Share2, Plus, Sun, Zap, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ActivityRow } from "@/components/planner/activity-row";
import { activities } from "@/data/activities";
import { formatDateLong } from "@/lib/format";
import type { ItineraryDay, ResolvedItinerary, ResolvedItineraryDay } from "@/lib/types";

const NEXT_TIME_SLOTS = ["9:00 AM", "11:30 AM", "2:30 PM", "6:00 PM", "8:00 PM"];

function toRawDays(days: ResolvedItineraryDay[]): ItineraryDay[] {
  return days.map((d) => ({
    dayNumber: d.dayNumber,
    date: d.date,
    theme: d.theme,
    items: d.items.map((i) => ({ activitySlug: i.activitySlug, time: i.time, why: i.why })),
  }));
}

async function persist(id: string, days: ItineraryDay[]) {
  const res = await fetch(`/api/itinerary/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "replace-days", days }),
  });
  const data = await res.json();
  return data.itinerary as ResolvedItinerary;
}

export function ItineraryView({
  itinerary,
  onUpdate,
}: {
  itinerary: ResolvedItinerary;
  onUpdate: (next: ResolvedItinerary) => void;
}) {
  const [busyDay, setBusyDay] = React.useState<number | null>(null);
  const [email, setEmail] = React.useState("");
  const [emailState, setEmailState] = React.useState<"idle" | "sending" | "sent" | "error">("idle");
  const [copied, setCopied] = React.useState(false);

  const usedSlugs = new Set(itinerary.days.flatMap((d) => d.items.map((i) => i.activitySlug)));

  async function applyDays(nextDays: ResolvedItineraryDay[]) {
    const raw = toRawDays(nextDays);
    onUpdate({ ...itinerary, days: nextDays, totalEstimate: itinerary.totalEstimate });
    const saved = await persist(itinerary.id, raw);
    onUpdate(saved);
  }

  function replaceActivity(dayNumber: number, itemIndex: number) {
    const day = itinerary.days.find((d) => d.dayNumber === dayNumber);
    if (!day) return;
    const current = day.items[itemIndex];
    const candidate = activities.find(
      (a) =>
        a.slug !== current.activitySlug &&
        !usedSlugs.has(a.slug) &&
        a.categories.some((c) => current.activity.categories.includes(c))
    );
    if (!candidate) return;
    const nextDays = itinerary.days.map((d) =>
      d.dayNumber !== dayNumber
        ? d
        : {
            ...d,
            items: d.items.map((it, i) =>
              i === itemIndex
                ? { ...it, activitySlug: candidate.slug, activity: candidate, why: "Swapped in as an alternative pick." }
                : it
            ),
          }
    );
    applyDays(nextDays);
  }

  function removeActivity(dayNumber: number, itemIndex: number) {
    const nextDays = itinerary.days.map((d) =>
      d.dayNumber !== dayNumber ? d : { ...d, items: d.items.filter((_, i) => i !== itemIndex) }
    );
    applyDays(nextDays);
  }

  function moveActivity(dayNumber: number, itemIndex: number, targetDay: number) {
    const source = itinerary.days.find((d) => d.dayNumber === dayNumber);
    if (!source) return;
    const item = source.items[itemIndex];
    const nextDays = itinerary.days.map((d) => {
      if (d.dayNumber === dayNumber) return { ...d, items: d.items.filter((_, i) => i !== itemIndex) };
      if (d.dayNumber === targetDay) return { ...d, items: [...d.items, item] };
      return d;
    });
    applyDays(nextDays);
  }

  function addActivity(dayNumber: number) {
    const day = itinerary.days.find((d) => d.dayNumber === dayNumber);
    if (!day) return;
    const candidate = activities.find(
      (a) => !usedSlugs.has(a.slug) && a.interests.some((i) => itinerary.preferences.interests.includes(i))
    ) ?? activities.find((a) => !usedSlugs.has(a.slug));
    if (!candidate) return;
    const time = NEXT_TIME_SLOTS[day.items.length % NEXT_TIME_SLOTS.length];
    const nextDays = itinerary.days.map((d) =>
      d.dayNumber !== dayNumber
        ? d
        : { ...d, items: [...d.items, { activitySlug: candidate.slug, activity: candidate, time, why: "Added to round out the day." }] }
    );
    applyDays(nextDays);
  }

  async function adjustDay(dayNumber: number, direction: "relaxing" | "adventurous") {
    setBusyDay(dayNumber);
    const res = await fetch(`/api/itinerary/${itinerary.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "adjust-day", dayNumber, direction }),
    });
    const data = await res.json();
    setBusyDay(null);
    onUpdate(data.itinerary as ResolvedItinerary);
  }

  async function sendEmail(e: React.FormEvent) {
    e.preventDefault();
    setEmailState("sending");
    try {
      const res = await fetch("/api/send-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itineraryId: itinerary.id, email }),
      });
      if (!res.ok) throw new Error();
      setEmailState("sent");
    } catch {
      setEmailState("error");
    }
  }

  function share() {
    const url = `${window.location.origin}/trip/${itinerary.id}`;
    if (navigator.share) {
      navigator.share({ title: "My Aruba itinerary", url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card p-5">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Estimated activities budget</p>
          <p className="text-2xl font-bold">${itinerary.totalEstimate}</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={share}>
            <Share2 className="size-4" /> {copied ? "Link copied" : "Share My Itinerary"}
          </Button>
          <Button asChild variant="outline">
            <Link href={`/trip/${itinerary.id}`}>Save My Trip</Link>
          </Button>
        </div>
      </div>

      {itinerary.days.map((day) => (
        <div key={day.dayNumber}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-primary">
                Day {day.dayNumber} &middot; {formatDateLong(day.date)}
              </span>
              <h3 className="font-display text-2xl font-bold">{day.theme}</h3>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={busyDay === day.dayNumber}
                onClick={() => adjustDay(day.dayNumber, "relaxing")}
              >
                {busyDay === day.dayNumber ? <Loader2 className="size-3.5 animate-spin" /> : <Sun className="size-3.5" />}
                More relaxing
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={busyDay === day.dayNumber}
                onClick={() => adjustDay(day.dayNumber, "adventurous")}
              >
                {busyDay === day.dayNumber ? <Loader2 className="size-3.5 animate-spin" /> : <Zap className="size-3.5" />}
                More adventurous
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {day.items.map((item, i) => (
              <ActivityRow
                key={`${item.activitySlug}-${i}`}
                item={item}
                dayNumber={day.dayNumber}
                totalDays={itinerary.days.length}
                onReplace={() => replaceActivity(day.dayNumber, i)}
                onRemove={() => removeActivity(day.dayNumber, i)}
                onMove={(target) => moveActivity(day.dayNumber, i, target)}
              />
            ))}
            {day.items.length === 0 && (
              <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Nothing planned yet for this day.
              </p>
            )}
          </div>

          <Button type="button" variant="ghost" size="sm" className="mt-3" onClick={() => addActivity(day.dayNumber)}>
            <Plus className="size-3.5" /> Add activity
          </Button>
        </div>
      ))}

      <div className="rounded-2xl border border-border/70 bg-card p-6 sm:p-8">
        <h3 className="font-display text-xl font-bold">Your Aruba itinerary is ready.</h3>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Send it to your inbox with clickable booking links for every activity.
        </p>
        <form onSubmit={sendEmail} className="mt-4 flex flex-col gap-2.5 sm:flex-row">
          <Input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="sm:max-w-xs"
          />
          <Button type="submit" disabled={emailState === "sending" || emailState === "sent"}>
            {emailState === "sending" ? (
              <Loader2 className="animate-spin" />
            ) : emailState === "sent" ? (
              <Check />
            ) : (
              <Mail />
            )}
            {emailState === "sent" ? "Sent" : "Email My Itinerary"}
          </Button>
        </form>
        {emailState === "error" && (
          <p className="mt-2 text-sm text-destructive">Something went wrong sending that. Try again in a moment.</p>
        )}
      </div>
    </div>
  );
}
