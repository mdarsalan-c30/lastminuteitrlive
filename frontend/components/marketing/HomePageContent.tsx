"use client";

import { useState } from "react";
import { LandingJsonLd } from "@/components/marketing/LandingJsonLd";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { ExpandedFaq } from "@/components/marketing/ExpandedFaq";
import { FinalCta } from "@/components/marketing/FinalCta";
import { PricingSection } from "@/components/marketing/PricingSection";
import { QuickStart } from "@/components/marketing/QuickStart";
import { WhyUsSection } from "@/components/marketing/WhyUsSection";
import { HeroSection } from "@/components/marketing/HeroSection";
import { ReviewsCarousel } from "@/components/marketing/ReviewsCarousel";
import { CommonSituations } from "@/components/marketing/CommonSituations";
import { ToolsSection } from "@/components/marketing/ToolsSection";
import { B2BHowItWorks, B2BTools, B2BPricing, B2BFAQ } from "@/components/marketing/B2BMarketing";
import type { HeroRibbonConfig } from "@/lib/marketing/heroRibbon";

export function HomePageContent({
  heroRibbon,
}: {
  heroRibbon: HeroRibbonConfig | null;
}) {
  const [mode, setMode] = useState<"b2c" | "b2b">("b2c");

  return (
    <>
      <LandingJsonLd />
      <main>
        {/* HERO */}
        <HeroSection mode={mode} setMode={setMode} ribbon={heroRibbon} />

        {/* Dynamic Content based on Mode */}
        {mode === "b2c" ? (
          <>
            <HowItWorks />
            <ToolsSection />
            <QuickStart />
            <WhyUsSection />
            <CommonSituations />
            <ReviewsCarousel />
            <PricingSection />
            <FinalCta />
            <ExpandedFaq maxItems={7} />
          </>
        ) : (
          <>
            <B2BHowItWorks />
            <B2BTools />
            <B2BPricing />
            <B2BFAQ />
          </>
        )}
      </main>
    </>
  );
}
