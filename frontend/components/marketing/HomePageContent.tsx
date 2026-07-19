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
import { ToolsSection } from "@/components/marketing/ToolsSection";
import { B2BHowItWorks, B2BTools, B2BPricing, B2BFAQ } from "@/components/marketing/B2BMarketing";

export function HomePageContent() {
  const [mode, setMode] = useState<"b2c" | "b2b">("b2c");

  return (
    <>
      <LandingJsonLd />
      <main>
        {/* HERO */}
        <HeroSection mode={mode} setMode={setMode} />

        {/* Dynamic Content based on Mode */}
        {mode === "b2c" ? (
          <>
            <HowItWorks />
            <ToolsSection />
            <QuickStart />
            <WhyUsSection />
            <ReviewsCarousel />
            <PricingSection />
            <FinalCta />
            <ExpandedFaq maxItems={5} />
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
