import type { Metadata } from "next";
import { HomePageContent } from "@/components/marketing/HomePageContent";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { pageMetadata } from "@/lib/seo";
import { SITE_TAGLINE } from "@/lib/constants";

export const metadata: Metadata = pageMetadata({
  title: "File your own ITR — Your Smart AI Tax Assistant",
  description: SITE_TAGLINE,
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
