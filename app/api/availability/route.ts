import { getProvider } from "@/lib/booking";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  const date = url.searchParams.get("date");

  if (!slug || !date) {
    return Response.json({ error: "slug and date query params are required." }, { status: 400 });
  }

  const activity = await getProvider().getActivity(slug);
  if (!activity) {
    return Response.json({ error: "Activity not found." }, { status: 404 });
  }

  const slots = await getProvider().getAvailability(slug, date);
  return Response.json({ slots });
}
