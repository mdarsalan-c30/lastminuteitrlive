import type { Metadata } from "next";
import { HomePageContent } from "@/components/marketing/HomePageContent";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { pageMetadata } from "@/lib/seo";
import { SITE_TAGLINE } from "@/lib/constants";
import { getPublishedHeroRibbon } from "@/lib/marketing/heroRibbon.server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Your Personal Income-Tax filing companion",
  description: "Built for quick and easy ITR filing, suggesting smart ways to claim your returns.",
  path: "/",
});

export default async function HomePage() {
  const heroRibbon = await getPublishedHeroRibbon();

  return (
    <>
      <SiteHeader />
      <HomePageContent heroRibbon={heroRibbon} />
      <SiteFooter />
    </>
  );
}
