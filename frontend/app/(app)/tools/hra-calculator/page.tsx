import { PageShell } from "@/components/layout/PageShell";
import { HraCalculator } from "@/components/tools/HraCalculator";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HRA Exemption Calculator | LastMinuteITR",
  description: "Calculate your exact House Rent Allowance exemption.",
};

export default function HraCalculatorPage() {
  return (
    <>
      <SiteHeader />
      <PageShell className="py-10 sm:py-12" contentClassName="max-w-3xl">
        <HraCalculator />
      </PageShell>
      <SiteFooter />
    </>
  );
}
