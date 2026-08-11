import { NextResponse, type NextRequest } from "next/server";

/**
 * Gates /admin behind HTTP Basic Auth. Off by default: if ADMIN_USER/
 * ADMIN_PASSWORD aren't set, the dashboard refuses to serve rather than
 * falling open, so nobody accidentally ships an unlocked admin panel.
 */
export function middleware(req: NextRequest) {
  const user = process.env.ADMIN_USER;
  const password = process.env.ADMIN_PASSWORD;

  if (!user || !password) {
    return new NextResponse("Admin dashboard is not configured. Set ADMIN_USER and ADMIN_PASSWORD.", {
      status: 503,
    });
  }

  const auth = req.headers.get("authorization");
  if (auth) {
    const [, encoded] = auth.split(" ");
    const [providedUser, providedPassword] = atob(encoded ?? "").split(":");
    if (providedUser === user && providedPassword === password) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="ToDo Aruba Admin"' },
  });
}

export const config = {
  matcher: "/admin/:path*",
};
