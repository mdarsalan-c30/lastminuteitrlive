import type { Metadata } from "next";
import { HomePageContent } from "@/components/marketing/HomePageContent";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { pageMetadata } from "@/lib/seo";
import { SITE_TAGLINE } from "@/lib/constants";

export const metadata: Metadata = pageMetadata({
  title: "Your Personal Income-Tax filing companion",
  description: "Built for quick and easy ITR filing, suggesting smart ways to claim your returns.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <HomePageContent />
      <SiteFooter />
    </>
  );
}
