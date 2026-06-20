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
import { TYPOGRAPHY_SCALE } from "@/lib/design/layout";
import { SITE_TAGLINE } from "@/lib/constants";
import { pageMetadata } from "@/lib/seo";

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
          <section className="hero-mesh relative overflow-hidden border-b border-border/40 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-6xl min-w-0 py-6 lg:py-8">
              <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.68fr)] xl:grid-cols-[minmax(0,1.28fr)_minmax(280px,0.6fr)] lg:gap-6 xl:gap-8">
                <div className="min-w-0 text-center lg:text-left lg:pr-2 xl:pr-4">
                  <h1
                    className={`landing-reveal landing-reveal-delay-1 font-heading font-semibold text-foreground ${TYPOGRAPHY_SCALE.display}`}
                  >
                    {HERO_HEADLINE}
                    <br />
                    <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                      {HERO_HEADLINE_ACCENT}
                    </span>
                  </h1>
                  <p
                    className={`landing-reveal landing-reveal-delay-2 mx-auto mt-2 max-w-xl text-muted-foreground lg:mx-0 ${TYPOGRAPHY_SCALE.caption} sm:mt-2.5`}
                  >
                    {HERO_EMOTIONAL_HOOK}
                  </p>
                  <div className="landing-reveal landing-reveal-delay-3 mx-auto mt-4 max-w-xl lg:mx-0">
                    <CompanionModeCallout variant="cta-only" />
                  </div>
                </div>

                <HeroParallax className="landing-reveal landing-reveal-delay-2 relative min-w-0 lg:justify-self-end lg:pl-2 xl:pl-6">
                  <RegimeCompareCard
                    className="relative ml-auto w-full max-w-[18.5rem] sm:max-w-[19rem] xl:max-w-[20rem]"
                    compact
                  />
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
