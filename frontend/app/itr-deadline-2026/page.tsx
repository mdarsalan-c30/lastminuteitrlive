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

const config = getSeoLandingPage("itr-deadline-2026");

export function generateMetadata(): Metadata {
  if (!config) return { title: "Not found" };
  const article = getLandingLearnContent(config.learnSlug);
  if (!article) return { title: "Not found" };
  return buildLandingMetadata(config, article);
}

export default function ItrDeadline2026LandingPage() {
  if (!config) notFound();
  const article = getLandingLearnContent(config.learnSlug);
  if (!article) notFound();
  return <SeoLandingPageView config={config} article={article} />;
}
