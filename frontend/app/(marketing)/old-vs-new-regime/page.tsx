import { notFound } from "next/navigation";
import {
  buildLandingMetadata,
  SeoLandingPageView,
} from "@/components/marketing/SeoLandingPage";
import {
  getLandingLearnContent,
  getSeoLandingPage,
} from "@/lib/seo/landing-pages";
import type { Metadata } from "next";

const config = getSeoLandingPage("old-vs-new-regime");

export function generateMetadata(): Metadata {
  if (!config) return { title: "Not found" };
  const article = getLandingLearnContent(config.learnSlug);
  if (!article) return { title: "Not found" };
  return buildLandingMetadata(config, article);
}

export default function OldVsNewRegimeLandingPage() {
  if (!config) notFound();
  const article = getLandingLearnContent(config.learnSlug);
  if (!article) notFound();
  return <SeoLandingPageView config={config} article={article} />;
}
