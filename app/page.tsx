import { Navbar } from "@/components/sections/navbar";
import { Hero } from "@/components/sections/hero";
import { TopActivities } from "@/components/sections/top-activities";
import { CategoryExplorer } from "@/components/sections/category-explorer";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Footer } from "@/components/sections/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <TopActivities />
        <CategoryExplorer />
        <HowItWorks />
      </main>
      <Footer />
    </>
  );
}
