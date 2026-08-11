import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { BookingFlow } from "@/components/booking/booking-flow";
import { getActivity } from "@/data/activities";

export const metadata: Metadata = {
  title: "Complete your booking",
  robots: { index: false, follow: false },
};

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const activity = getActivity(slug);
  if (!activity) notFound();

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <BookingFlow activity={activity} />
      </main>
      <Footer />
    </>
  );
}
