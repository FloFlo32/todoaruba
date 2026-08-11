import Link from "next/link";
import type { Metadata } from "next";
import { activities } from "@/data/activities";
import { categories } from "@/data/categories";
import { destinations } from "@/data/destinations";
import { listItineraries, listLeads, listClicks, listBookings } from "@/lib/store";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

const COMMISSION_RATE = 0.15;

function Card({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-5">
      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-3xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        {action}
      </div>
      <div className="overflow-x-auto rounded-xl border border-border/70 bg-card">{children}</div>
    </section>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return <th className="whitespace-nowrap px-4 py-2.5 text-left font-mono text-xs uppercase tracking-wide text-muted-foreground">{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`whitespace-nowrap px-4 py-2.5 text-sm ${className ?? ""}`}>{children}</td>;
}

export default function AdminPage() {
  const itineraries = listItineraries();
  const leads = listLeads();
  const clicks = listClicks();
  const bookings = listBookings();
  const estimatedCommission = clicks.reduce((sum, c) => sum + c.priceFrom * COMMISSION_RATE, 0);
  const confirmedCommission = bookings.reduce((sum, b) => sum + b.commission, 0);
  const confirmedRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);

  return (
    <div className="min-h-full bg-secondary/30">
      <div className="container-px mx-auto max-w-6xl py-10">
        <h1 className="font-display text-3xl font-bold">ToDo Aruba Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Demo data store (in-memory, resets on redeploy). Swap for a real database before launch.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Card label="Itineraries" value={itineraries.length} />
          <Card label="Leads (emails)" value={leads.length} />
          <Card label="Referral clicks" value={clicks.length} />
          <Card label="Confirmed bookings" value={bookings.length} />
          <Card label="Booked revenue" value={`$${confirmedRevenue.toFixed(0)}`} />
          <Card label="Confirmed commission" value={`$${confirmedCommission.toFixed(2)}`} hint={`at ${COMMISSION_RATE * 100}% take rate`} />
        </div>

        <Section title="Generated itineraries">
          <table className="w-full">
            <thead className="border-b border-border/70">
              <tr>
                <Th>Created</Th>
                <Th>Trip</Th>
                <Th>Travelers</Th>
                <Th>Interests</Th>
                <Th>Est. total</Th>
                <Th />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {itineraries.length === 0 && (
                <tr>
                  <Td>No itineraries generated yet.</Td>
                </tr>
              )}
              {itineraries.slice(0, 50).map((it) => (
                <tr key={it.id}>
                  <Td>{new Date(it.createdAt).toLocaleString()}</Td>
                  <Td>
                    {it.preferences.arrival} &rarr; {it.preferences.departure} ({it.days.length}d)
                  </Td>
                  <Td>
                    {it.preferences.adults}A{it.preferences.children ? ` / ${it.preferences.children}C` : ""}
                  </Td>
                  <Td className="max-w-xs truncate">{it.preferences.interests.join(", ") || "—"}</Td>
                  <Td>${it.totalEstimate}</Td>
                  <Td>
                    <Link href={`/trip/${it.id}`} className="text-primary hover:underline">
                      View
                    </Link>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="Confirmed bookings">
          <table className="w-full">
            <thead className="border-b border-border/70">
              <tr>
                <Th>Booked</Th>
                <Th>Confirmation</Th>
                <Th>Activity</Th>
                <Th>Date / Time</Th>
                <Th>Party</Th>
                <Th>Provider</Th>
                <Th>Total</Th>
                <Th>Commission</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {bookings.length === 0 && (
                <tr>
                  <Td>No bookings confirmed yet.</Td>
                </tr>
              )}
              {bookings.slice(0, 50).map((b) => (
                <tr key={b.id}>
                  <Td>{new Date(b.createdAt).toLocaleString()}</Td>
                  <Td className="font-mono">{b.confirmationCode}</Td>
                  <Td>
                    <Link href={`/activity/${b.activitySlug}`} className="hover:underline">
                      {b.activitySlug}
                    </Link>
                  </Td>
                  <Td>
                    {b.date} &middot; {b.time}
                  </Td>
                  <Td>{b.partySize}</Td>
                  <Td className="capitalize">{b.providerId}</Td>
                  <Td>${b.totalPrice.toFixed(2)}</Td>
                  <Td className="font-medium text-foreground">${b.commission.toFixed(2)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="Leads">
          <table className="w-full">
            <thead className="border-b border-border/70">
              <tr>
                <Th>Captured</Th>
                <Th>Email</Th>
                <Th>Itinerary</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {leads.length === 0 && (
                <tr>
                  <Td>No leads captured yet.</Td>
                </tr>
              )}
              {leads.slice(0, 50).map((l) => (
                <tr key={l.id}>
                  <Td>{new Date(l.createdAt).toLocaleString()}</Td>
                  <Td>{l.email}</Td>
                  <Td>
                    <Link href={`/trip/${l.itineraryId}`} className="text-primary hover:underline">
                      {l.itineraryId}
                    </Link>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="Booking referral clicks">
          <table className="w-full">
            <thead className="border-b border-border/70">
              <tr>
                <Th>Clicked</Th>
                <Th>Activity</Th>
                <Th>Provider</Th>
                <Th>Price</Th>
                <Th>Est. commission</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {clicks.length === 0 && (
                <tr>
                  <Td>No booking clicks tracked yet.</Td>
                </tr>
              )}
              {clicks.slice(0, 50).map((c) => (
                <tr key={c.id}>
                  <Td>{new Date(c.createdAt).toLocaleString()}</Td>
                  <Td>{c.activitySlug}</Td>
                  <Td className="capitalize">{c.providerId}</Td>
                  <Td>${c.priceFrom}</Td>
                  <Td>${(c.priceFrom * COMMISSION_RATE).toFixed(2)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title={`Activities (${activities.length})`}>
          <table className="w-full">
            <thead className="border-b border-border/70">
              <tr>
                <Th>Name</Th>
                <Th>Category</Th>
                <Th>Provider</Th>
                <Th>Price</Th>
                <Th>Rating</Th>
                <Th>Featured</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {activities.map((a) => (
                <tr key={a.slug}>
                  <Td>
                    <Link href={`/activity/${a.slug}`} className="hover:underline">
                      {a.name}
                    </Link>
                  </Td>
                  <Td className="capitalize">{a.categories.join(", ")}</Td>
                  <Td className="capitalize">{a.providerId}</Td>
                  <Td>${a.priceFrom}</Td>
                  <Td>{a.review.rating}</Td>
                  <Td>{a.featured ? <Badge variant="accent">Featured</Badge> : "—"}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Section title={`Categories (${categories.length})`}>
            <table className="w-full">
              <tbody className="divide-y divide-border/60">
                {categories.map((c) => (
                  <tr key={c.slug}>
                    <Td>{c.name}</Td>
                    <Td>{activities.filter((a) => a.categories.includes(c.slug)).length} activities</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title="Destinations">
            <table className="w-full">
              <tbody className="divide-y divide-border/60">
                {destinations.map((d) => (
                  <tr key={d.slug}>
                    <Td>{d.name}</Td>
                    <Td>{d.live ? <Badge variant="accent">Live</Badge> : <Badge variant="secondary">Planned</Badge>}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        </div>
      </div>
    </div>
  );
}
