import { AutoPricingDemo } from "@/components/landing/auto-pricing-demo";
import { BeforeAfter } from "@/components/landing/before-after";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { Hero } from "@/components/landing/hero";
import { PricingTable } from "@/components/landing/pricing-table";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { StatsSection } from "@/components/landing/stats-section";
import { TemplatesGrid } from "@/components/landing/templates-grid";
import { Testimonials } from "@/components/landing/testimonials";
import { UsageGuide } from "@/components/landing/usage-guide";
import { VoiceToProposalDemo } from "@/components/landing/voice-to-proposal-demo";
import { getLtdSeatsRemaining } from "@/lib/ltd-seats";

export default async function LandingPage() {
  const ltdSeatsRemaining = await getLtdSeatsRemaining();

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <StatsSection />
        <UsageGuide />
        <BeforeAfter />
        <VoiceToProposalDemo />
        <AutoPricingDemo />
        <TemplatesGrid />
        <Testimonials />
        <PricingTable ltdSeatsRemaining={ltdSeatsRemaining} />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
