import { BeforeAfter } from "@/components/landing/before-after";
import { FinalCta } from "@/components/landing/final-cta";
import { Hero } from "@/components/landing/hero";
import { PricingTable } from "@/components/landing/pricing-table";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { TemplatesGrid } from "@/components/landing/templates-grid";
import { getLtdSeatsRemaining } from "@/lib/ltd-seats";

export default async function LandingPage() {
  const ltdSeatsRemaining = await getLtdSeatsRemaining();

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <BeforeAfter />
        <TemplatesGrid />
        <PricingTable ltdSeatsRemaining={ltdSeatsRemaining} />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
