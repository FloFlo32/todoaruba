"use client";

import Script from "next/script";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Activity } from "@/lib/types";

/** The bare widget, no chrome, no size constraint. */
function ViatorWidgetRaw({ partnerId, widgetRef }: { partnerId: string; widgetRef: string }) {
  return (
    <>
      <div data-vi-partner-id={partnerId} data-vi-widget-ref={widgetRef} />
      <Script async src="https://www.viator.com/orion/partner/widget.js" strategy="lazyOnload" />
    </>
  );
}

/**
 * The live widget, capped to a fixed height with scroll: at narrow widths
 * (sidebar/card columns) Viator's widget collapses to a single column and
 * inflates to 5000px+, which would blow out the surrounding layout if left
 * unbounded. Use only where the widget sits in a narrow column alongside
 * other content, e.g. the activity page sidebar.
 */
export function ViatorWidgetEmbed({ partnerId, widgetRef }: { partnerId: string; widgetRef: string }) {
  return (
    <div className="max-h-[420px] overflow-y-auto rounded-lg">
      <ViatorWidgetRaw partnerId={partnerId} widgetRef={widgetRef} />
    </div>
  );
}

/** Sticky sidebar embed for the activity detail page: widget in its own card, no page chrome. */
export function ViatorWidgetInline({ partnerId, widgetRef }: { partnerId: string; widgetRef: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <ViatorWidgetEmbed partnerId={partnerId} widgetRef={widgetRef} />
    </div>
  );
}

/**
 * One widget for a whole browsing page (category listings, the homepage
 * favorites section), replacing a hand-built grid of cards. Left unbounded:
 * at full page width the widget lays itself out as a proper multi-column
 * tour grid, so there's no narrow-column collapse to guard against here.
 */
export function ViatorWidgetGrid({ partnerId, widgetRef }: { partnerId: string; widgetRef: string }) {
  return <ViatorWidgetRaw partnerId={partnerId} widgetRef={widgetRef} />;
}

/** Standalone page embed, used by /book/[slug] for anyone who lands there directly. Left unbounded here since the page has no surrounding layout to break. */
export function ViatorWidget({
  activity,
  partnerId,
  widgetRef,
}: {
  activity: Activity;
  partnerId: string;
  widgetRef: string;
}) {
  return (
    <div className="container-px mx-auto max-w-3xl py-10 sm:py-14">
      <Link
        href={`/activity/${activity.slug}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to {activity.name}
      </Link>

      <h1 className="mt-4 text-balance font-display text-2xl font-bold sm:text-3xl">{activity.name}</h1>

      <div className="mt-8">
        <ViatorWidgetRaw partnerId={partnerId} widgetRef={widgetRef} />
      </div>
    </div>
  );
}
