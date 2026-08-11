"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Minus, Plus, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DynamicIcon } from "@/components/icon-map";
import { interestOptions } from "@/data/interests";
import { cn } from "@/lib/utils";
import type { Interest, TripPreferences } from "@/lib/types";

function inDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Not asked as a question — kept as a reasonable default sent along with the
 * request, since the API still expects a budget field. */
const DEFAULT_BUDGET = 1000;

const STEP_TITLES = [
  "When are you traveling?",
  "Who's coming?",
  "What do you love?",
  "What's your pace?",
  "Anything else we should know?",
];

function Stepper({
  value,
  onChange,
  min,
  max,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4">
      <span className="text-base font-medium">{label}</span>
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="grid size-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        >
          <Minus className="size-4" />
        </button>
        <span className="w-6 text-center text-lg font-semibold tabular-nums">{value}</span>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="grid size-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
}

export function TripWizard() {
  const router = useRouter();

  const [step, setStep] = React.useState(0);
  const [arrival, setArrival] = React.useState(inDays(30));
  const [departure, setDeparture] = React.useState(inDays(35));
  const [adults, setAdults] = React.useState(2);
  const [children, setChildren] = React.useState(0);
  const [interests, setInterests] = React.useState<Interest[]>([]);
  const [tripStyle, setTripStyle] = React.useState<TripPreferences["tripStyle"]>("balanced");
  const [notes, setNotes] = React.useState("");

  const [generating, setGenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const totalSteps = STEP_TITLES.length;

  function toggleInterest(value: Interest) {
    setInterests((prev) => (prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value]));
  }

  const isValid = React.useMemo(() => {
    switch (step) {
      case 0:
        return !!arrival && !!departure && departure >= arrival;
      case 1:
        return adults >= 1;
      case 2:
        return interests.length > 0;
      default:
        return true;
    }
  }, [step, arrival, departure, adults, interests]);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    const preferences: TripPreferences = {
      arrival,
      departure,
      adults,
      children,
      interests,
      budget: DEFAULT_BUDGET,
      tripStyle,
      notes: notes.slice(0, 600),
    };
    try {
      const res = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      try {
        localStorage.setItem("todoAruba:lastTripId", data.itinerary.id);
      } catch {
        // localStorage unavailable — not critical
      }
      router.push(`/trip/${data.itinerary.id}`);
    } catch {
      setError("Something went wrong building your itinerary. Please try again.");
      setGenerating(false);
    }
  }

  function handleNext() {
    if (!isValid) return;
    if (step === totalSteps - 1) {
      handleGenerate();
    } else {
      setStep((s) => s + 1);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !(e.target as HTMLElement).closest("textarea")) {
      e.preventDefault();
      handleNext();
    }
  }

  if (generating) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
        <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Sparkles className="size-6 animate-pulse" />
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold sm:text-3xl">
          Building your perfect Aruba itinerary
        </h1>
        <p className="mt-2 text-muted-foreground">Give us a couple seconds...</p>
      </div>
    );
  }

  return (
    <div className="container-px mx-auto flex min-h-[80vh] max-w-2xl flex-col py-8" onKeyDown={handleKeyDown}>
      <div className="flex items-center gap-4">
        <Link
          href="/"
          aria-label="Close"
          className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="size-4.5" />
        </Link>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          />
        </div>
        <span className="shrink-0 font-mono text-xs text-muted-foreground">
          {step + 1} / {totalSteps}
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-center py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-balance text-center font-display text-3xl font-bold sm:text-4xl">
              {STEP_TITLES[step]}
            </h1>

            <div className="mt-8">
              {step === 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="arrival" className="mb-1.5 block text-sm font-medium">
                      Arrival date
                    </label>
                    <Input
                      id="arrival"
                      type="date"
                      autoFocus
                      value={arrival}
                      min={inDays(0)}
                      onChange={(e) => setArrival(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="departure" className="mb-1.5 block text-sm font-medium">
                      Departure date
                    </label>
                    <Input
                      id="departure"
                      type="date"
                      value={departure}
                      min={arrival}
                      onChange={(e) => setDeparture(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-3">
                  <Stepper label="Adults" value={adults} onChange={setAdults} min={1} max={12} />
                  <Stepper label="Children" value={children} onChange={setChildren} min={0} max={10} />
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-wrap justify-center gap-2.5">
                  {interestOptions.map((opt) => {
                    const active = interests.includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => toggleInterest(opt.value)}
                        aria-pressed={active}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                        )}
                      >
                        <DynamicIcon name={opt.icon} className="size-3.5" />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {step === 3 && (
                <div className="grid gap-3 sm:grid-cols-3">
                  {(
                    [
                      { value: "relaxed", desc: "A couple activities a day, lots of beach time" },
                      { value: "balanced", desc: "A good mix of activities and downtime" },
                      { value: "packed", desc: "Something new almost every slot" },
                    ] as const
                  ).map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setTripStyle(s.value)}
                      aria-pressed={tripStyle === s.value}
                      className={cn(
                        "rounded-xl border p-4 text-left transition-colors",
                        tripStyle === s.value
                          ? "border-primary bg-primary/10"
                          : "border-border bg-background hover:border-primary/40"
                      )}
                    >
                      <span className="block font-semibold capitalize">{s.value}</span>
                      <span className="mt-1 block text-sm text-muted-foreground">{s.desc}</span>
                    </button>
                  ))}
                </div>
              )}

              {step === 4 && (
                <div>
                  <Textarea
                    autoFocus
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="It's our honeymoon, we love the water but want at least one lazy beach day... (optional)"
                    className="min-h-32"
                  />
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {error && (
        <p role="alert" className="mb-4 text-center text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
          <ArrowLeft className="size-4" /> Back
        </Button>
        <Button type="button" size="lg" onClick={handleNext} disabled={!isValid}>
          {step === totalSteps - 1 ? (
            "Plan My Trip"
          ) : (
            <>
              Next <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
