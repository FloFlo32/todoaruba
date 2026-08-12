import Script from "next/script";
import { Navbar } from "@/components/sections/navbar";
import { Hero } from "@/components/sections/hero";
import { TopActivities } from "@/components/sections/top-activities";
import { CategoryExplorer } from "@/components/sections/category-explorer";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Footer } from "@/components/sections/footer";

export default function Home() {
  return (
    <>
      <Script id="impact-radius" strategy="afterInteractive">
        {`(function(i,m,p,a,c,t){c.ire_o=p;c[p]=c[p]||function(){(c[p].a=c[p].a||[]).push(arguments)};t=a.createElement(m);var z=a.getElementsByTagName(m)[0];t.async=1;t.src=i;z.parentNode.insertBefore(t,z)})('https://utt.impactcdn.com/P-A7608378-4986-4b43-b530-97232281b0be1.js','script','impactStat',document,window);impactStat('transformLinks');impactStat('trackImpression');`}
      </Script>
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
