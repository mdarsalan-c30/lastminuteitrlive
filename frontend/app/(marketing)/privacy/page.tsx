import { LegalPageLayout } from "@/components/marketing/LegalPageLayout";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How LastMinute ITR handles your data — DPDP-aligned practices for ITR filing.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="10 June 2026">
      <p>
        LastMinute ITR (&quot;we&quot;, &quot;us&quot;) helps Indian taxpayers prepare income tax
        returns. This policy explains what data we collect, how we use it, and your choices.
      </p>
      <h2 className="text-base font-semibold text-foreground">What we collect</h2>
      <ul className="ml-6 list-disc space-y-1">
        <li>Documents you upload (e.g. Form 16, AIS) for parsing and reconciliation.</li>
        <li>Filing draft data you enter in the app (income, deductions, regime choice).</li>
        <li>Payment metadata when you purchase a plan (via Razorpay — we do not store card numbers).</li>
        <li>Optional feedback, chat messages, and profile details saved locally or submitted by you.</li>
      </ul>
      <h2 className="text-base font-semibold text-foreground">How we use data</h2>
      <p>
        We use your information only to provide ITR preparation, tax computation, companion filing
        guides, and support. We do not sell personal data. We do not file your return on the
        government portal — you submit on incometax.gov.in yourself.
      </p>
      <h2 className="text-base font-semibold text-foreground">AI Processing</h2>
      <p>
        Uploaded documents (such as Form 16 and AIS) may be processed by third-party Large Language
        Models (LLMs) and Artificial Intelligence to extract relevant tax data. While we take
        measures to secure this transmission, you acknowledge that AI extraction is probabilistic and
        assume the responsibility to verify all extracted figures.
      </p>
      <h2 className="text-base font-semibold text-foreground">Storage & security</h2>
      <p>
        Uploaded documents and draft data are processed with reasonable technical safeguards.
        Profile data in this MVP may be stored in your browser localStorage. Do not share your
        device with untrusted users if sensitive data is saved locally.
      </p>
      <h2 className="text-base font-semibold text-foreground">Your rights</h2>
      <p>
        You may request access, correction, or deletion of data we hold by emailing{" "}
        <a href="mailto:contact@lastminuteitr.in" className="text-primary underline">
          contact@lastminuteitr.in
        </a>
        . We respond within reasonable time under applicable Indian law including the DPDP Act.
      </p>
      <h2 className="text-base font-semibold text-foreground">Contact</h2>
      <p>
        Questions:{" "}
        <a href="mailto:contact@lastminuteitr.in" className="text-primary underline">
          contact@lastminuteitr.in
        </a>
      </p>
    </LegalPageLayout>
  );
}
