import { PageShell } from "@/components/layout/PageShell";
import { RentReceiptGenerator } from "@/components/tools/RentReceiptGenerator";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rent Receipt Generator | LastMinuteITR",
  description: "Instantly generate valid rent receipts to submit to your employer for HRA claims.",
};

export default function RentReceiptPage() {
  return (
    <>
      <SiteHeader />
      <PageShell className="py-10 sm:py-12" contentClassName="max-w-3xl">
        <RentReceiptGenerator />
      </PageShell>
      <SiteFooter />
    </>
  );
}
