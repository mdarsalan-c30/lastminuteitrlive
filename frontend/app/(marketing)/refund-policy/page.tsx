import { LegalPageLayout } from "@/components/marketing/LegalPageLayout";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
  title: "Refund Policy",
  description: "Refund and cancellation policy for LastMinute ITR paid plans.",
  path: "/refund-policy",
});

export default function RefundPolicyPage() {
  return (
    <LegalPageLayout title="Refund Policy" lastUpdated="10 June 2026">
      <p>
        This policy covers refunds for paid LastMinute ITR plans. Tax refunds from the Income Tax
        Department are separate — we do not guarantee any ITD refund amount or timeline.
      </p>
      <h2 className="text-base font-semibold text-foreground">Eligible refunds</h2>
      <ul className="ml-6 list-disc space-y-1">
        <li>
          Duplicate payment for the same assessment year and plan — contact us within 7 days.
        </li>
        <li>
          Platform downtime or system failure preventing access to a paid feature you purchased
          (Note: This does not include AI calculation errors) — we will fix or refund at our
          discretion.
        </li>
        <li>
          CA review plan: if review has not started within 48 hours of document submission, you may
          request a full refund.
        </li>
      </ul>
      <h2 className="text-base font-semibold text-foreground">Non-refundable</h2>
      <ul className="ml-6 list-disc space-y-1">
        <li>Plans where companion guide or CA review has already been delivered or unlocked.</li>
        <li>
          Claims that the AI generated an incorrect figure, missed a deduction, or misinterpreted
          a document. Because you are required to review all numbers before filing on the government
          portal, AI calculation errors do not qualify for a refund once the guide has been unlocked.
        </li>
        <li>Dissatisfaction with a lawful tax outcome (e.g. no refund due from ITD).</li>
        <li>User error after export or guide unlock (wrong figures copied to portal).</li>
      </ul>
      <h2 className="text-base font-semibold text-foreground">How to request</h2>
      <p>
        Email{" "}
        <a href="mailto:contact@lastminuteitr.in" className="text-primary underline">
          contact@lastminuteitr.in
        </a>{" "}
        with your payment ID, assessment year, and reason. Approved refunds are processed to the
        original payment method within 7–10 business days.
      </p>
    </LegalPageLayout>
  );
}
