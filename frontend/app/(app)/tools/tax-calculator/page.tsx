import { PageShell } from "@/components/layout/PageShell";
import { TaxEstimator } from "@/components/tools/TaxEstimator";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Old vs New Regime Tax Calculator | LastMinuteITR",
  description: "Compare your tax liability under both regimes to find out which one saves you more money.",
};

export default function TaxCalculatorPage() {
  return (
    <>
      <SiteHeader />
      <PageShell className="py-10 sm:py-12" contentClassName="max-w-4xl">
        <TaxEstimator />
      </PageShell>
      <SiteFooter />
    </>
  );
}
