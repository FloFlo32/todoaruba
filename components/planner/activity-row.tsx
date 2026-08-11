"use client";

import Link from "next/link";
import { Star, Clock, MapPin, Shuffle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/format";
import type { ResolvedItineraryItem } from "@/lib/types";

export function ActivityRow({
  item,
  dayNumber,
  totalDays,
  onReplace,
  onRemove,
  onMove,
}: {
  item: ResolvedItineraryItem;
  dayNumber: number;
  totalDays: number;
  onReplace: () => void;
  onRemove: () => void;
  onMove: (targetDay: number) => void;
}) {
  const { activity } = item;
  const otherDays = Array.from({ length: totalDays }, (_, i) => i + 1).filter((d) => d !== dayNumber);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border/70 bg-card p-4 sm:flex-row">
      <Link
        href={`/activity/${activity.slug}`}
        className="block h-40 w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:h-auto sm:w-40"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activity.images[0]}
          alt={activity.name}
          loading="lazy"
          decoding="async"
          className="size-full object-cover"
        />
      </Link>

      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-primary">
              {item.time}
            </span>
            <Link href={`/activity/${activity.slug}`}>
              <h4 className="mt-1 text-lg font-semibold leading-snug hover:underline">{activity.name}</h4>
            </Link>
          </div>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${activity.name} from day ${dayNumber}`}
            className="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
          >
            <X className="size-4" />
          </button>
        </div>

        <p className="mt-1.5 text-sm text-muted-foreground">{activity.shortDescription}</p>
        <p className="mt-2 text-sm italic text-foreground/80">&ldquo;{item.why}&rdquo;</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" /> {formatDuration(activity.durationMinutes)}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" /> {activity.location}
          </span>
          <span className="inline-flex items-center gap-1">
            <Star className="size-3.5 fill-primary text-primary" /> {activity.review.rating} ({activity.review.count})
          </span>
          <span className="font-semibold text-foreground">
            From ${activity.priceFrom} {activity.priceUnit}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button asChild size="sm">
            <a href={`/go/${activity.slug}`}>Book Now</a>
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onReplace}>
            <Shuffle className="size-3.5" /> Replace
          </Button>
          {otherDays.length > 0 && (
            <select
              aria-label={`Move ${activity.name} to another day`}
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) onMove(Number(e.target.value));
              }}
              className="h-9 rounded-md border border-border bg-background px-2.5 text-sm text-muted-foreground"
            >
              <option value="" disabled>
                Move to day...
              </option>
              {otherDays.map((d) => (
                <option key={d} value={d}>
                  Day {d}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  );
}
