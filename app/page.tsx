import { Navbar } from "@/components/sections/navbar";
import { Hero } from "@/components/sections/hero";
import { LogoCloud } from "@/components/sections/logo-cloud";
import { Bento } from "@/components/sections/bento";
import { Features } from "@/components/sections/features";
import { Proof } from "@/components/sections/stats";
import { CTA } from "@/components/sections/cta";
import { Footer } from "@/components/sections/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <LogoCloud />
        <Features />
        <Bento />
        <Proof />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
