import { getActivity } from "@/data/activities";
import { addClick } from "@/lib/store";

export const runtime = "nodejs";

/**
 * Every "Book Now" click routes through here first so the referral is
 * logged (source provider + activity + price, for commission tracking) before
 * the traveler lands on the provider's checkout. Real provider integrations
 * replace the redirect target below; the click-logging stays the same.
 */
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const activity = getActivity(slug);
  const url = new URL(req.url);

  if (!activity) {
    return Response.redirect(new URL("/things-to-do", url.origin), 302);
  }

  addClick({
    activitySlug: activity.slug,
    providerId: activity.providerId,
    providerActivityId: activity.providerActivityId,
    priceFrom: activity.priceFrom,
  });

  return Response.redirect(
    new URL(`/book/${activity.slug}?via=${activity.providerId}&ref=${activity.providerActivityId}`, url.origin),
    302
  );
}
