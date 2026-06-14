import { LearnHubPage } from "./LearnHubPage";
import { FaqJsonLd } from "@/components/marketing/FaqJsonLd";
import { HELP_FAQS } from "@/lib/content/faqs";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
  title: "Learn — ITR guides",
  description:
    "Guides on last-minute filing, tax regimes, AIS mismatches, and ITR form selection — Prep · Reconcile · File on portal.",
  path: "/learn",
});

export default function LearnPage() {
  return (
    <>
      <FaqJsonLd faqs={HELP_FAQS.slice(0, 3)} />
      <LearnHubPage />
    </>
  );
}
