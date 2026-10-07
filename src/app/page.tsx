import { FinalCta, SiteFooter } from "@/components/closing";
import { DealsRail } from "@/components/deals-rail";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { MenuBrowser } from "@/components/menu-browser";
import { SiteHeader } from "@/components/site-header";
import { YourWay } from "@/components/your-way";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <DealsRail />
        <MenuBrowser />
        <YourWay />
        <HowItWorks />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
