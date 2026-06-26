import { Marquee } from "@/components/magic/marquee";

const logos = [
  "Vercel",
  "Linear",
  "Stripe",
  "Supabase",
  "Framer",
  "Raycast",
  "Resend",
  "Clerk",
];

export function LogoCloud() {
  return (
    <section className="border-y border-border/60 bg-muted/30 py-10">
      <p className="container-px mx-auto mb-6 max-w-6xl text-center text-sm font-medium text-muted-foreground">
        The stack behind the teams everyone copies
      </p>
      <div className="relative">
        <Marquee pauseOnHover className="[--marquee-duration:35s]">
          {logos.map((logo) => (
            <span
              key={logo}
              className="font-display text-2xl font-semibold text-foreground/40 transition-colors hover:text-foreground"
            >
              {logo}
            </span>
          ))}
        </Marquee>
        {/* Edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent" />
      </div>
    </section>
  );
}
