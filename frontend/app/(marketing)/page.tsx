import type { Metadata } from "next";
import { CompanionModeCallout } from "@/components/marketing/CompanionModeCallout";
import { ExpandedFaq } from "@/components/marketing/ExpandedFaq";
import { FinalCta } from "@/components/marketing/FinalCta";
import { IndianUseCases } from "@/components/marketing/IndianUseCases";
import { LandingItrQuizSection } from "@/components/marketing/LandingItrQuizSection";
import { LandingJsonLd } from "@/components/marketing/LandingJsonLd";
import { LandingHowItWorksSection } from "@/components/marketing/LandingHowItWorksSection";
import { LandingPainStepsSection } from "@/components/marketing/LandingPainStepsSection";
import { LandingWhyAiBand } from "@/components/marketing/LandingWhyAiBand";
import { PopularGuides } from "@/components/marketing/PopularGuides";
import { PricingSection } from "@/components/marketing/PricingSection";
import { QuickStart } from "@/components/marketing/QuickStart";
import { RegimeCompareCard } from "@/components/marketing/RegimeCompareCard";
import { ReviewsCarousel } from "@/components/marketing/ReviewsCarousel";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { HeroParallax } from "@/components/motion/HeroParallax";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import {
  HERO_EMOTIONAL_HOOK,
  HERO_HEADLINE,
  HERO_HEADLINE_ACCENT,
} from "@/lib/copy/marketing";
import { HERO_LAYOUT, TYPOGRAPHY_SCALE } from "@/lib/design/layout";
import { SITE_TAGLINE } from "@/lib/constants";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const metadata: Metadata = pageMetadata({
  title: "File ITR before the deadline",
  description: SITE_TAGLINE,
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <LandingJsonLd />
      <SiteHeader />
      <main>
        <ScrollReveal delay={0}>
          <section className="hero-mesh relative overflow-hidden border-b border-border/40">
            <div className={cn("mx-auto w-full min-w-0", HERO_LAYOUT.container, HERO_LAYOUT.shell)}>
              <div className={HERO_LAYOUT.grid}>
                <div className={cn("min-w-0 text-center lg:text-left", HERO_LAYOUT.content)}>
                  <h1
                    className={cn(
                      "landing-reveal landing-reveal-delay-1 font-heading font-semibold text-foreground",
                      TYPOGRAPHY_SCALE.display,
                      HERO_LAYOUT.headline,
                      "mx-auto lg:mx-0"
                    )}
                  >
                    {HERO_HEADLINE}
                    <br />
                    <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                      {HERO_HEADLINE_ACCENT}
                    </span>
                  </h1>
                  <p
                    className={cn(
                      "landing-reveal landing-reveal-delay-2 mx-auto text-muted-foreground lg:mx-0",
                      TYPOGRAPHY_SCALE.body,
                      HERO_LAYOUT.subhead
                    )}
                  >
                    {HERO_EMOTIONAL_HOOK}
                  </p>
                  <div className="landing-reveal landing-reveal-delay-3 mx-auto w-full lg:mx-0">
                    <CompanionModeCallout variant="cta-only" />
                  </div>
                </div>

                <HeroParallax
                  className={cn(
                    "landing-reveal landing-reveal-delay-2 relative min-w-0",
                    HERO_LAYOUT.calculatorRail
                  )}
                >
                  <RegimeCompareCard className="relative w-full shadow-lg shadow-primary/5" />
                </HeroParallax>
              </div>
            </div>
          </section>
        </ScrollReveal>

        <LandingHowItWorksSection />
        <LandingPainStepsSection />
        <LandingItrQuizSection />
        <ReviewsCarousel />
        <LandingWhyAiBand />
        <IndianUseCases />
        <QuickStart />
        <PopularGuides />
        <ExpandedFaq />
        <PricingSection />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
