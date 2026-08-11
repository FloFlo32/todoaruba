import Link from "next/link";
import { Star, Clock } from "lucide-react";
import { formatDuration, formatPrice } from "@/lib/format";
import type { Activity } from "@/lib/types";

export function ActivityCard({ activity }: { activity: Activity }) {
  return (
    <Link
      href={`/activity/${activity.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activity.images[0]}
          alt={activity.name}
          loading="lazy"
          decoding="async"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <span className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground">
          <Star className="size-3.5 fill-primary text-primary" /> {activity.review.rating} ({activity.review.count})
          <span className="mx-1">&middot;</span>
          <Clock className="size-3.5" /> {formatDuration(activity.durationMinutes)}
        </span>
        <h3 className="text-lg font-semibold leading-snug">{activity.name}</h3>
        <p className="text-sm text-muted-foreground">{activity.shortDescription}</p>
        <p className="mt-auto pt-2 text-sm font-semibold text-foreground">
          {formatPrice(activity.priceFrom, activity.priceUnit)}
        </p>
      </div>
    </Link>
  );
}
