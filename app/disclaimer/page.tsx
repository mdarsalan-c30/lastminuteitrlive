import { LegalPageLayout } from "@/components/marketing/LegalPageLayout";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
  title: "Disclaimer",
  description: "Important disclaimers for LastMinute ITR users.",
  path: "/disclaimer",
});

export default function DisclaimerPage() {
  return (
    <LegalPageLayout title="Disclaimer" lastUpdated="10 June 2026">
      <h2 className="text-base font-semibold text-foreground">Government affiliation</h2>
      <p>
        LastMinute ITR is not affiliated with, endorsed by, or operated by the Income Tax
        Department, Central Board of Direct Taxes (CBDT), or any government authority.
      </p>
      <h2 className="text-base font-semibold text-foreground">Chartered accountant services</h2>
      <p>
        Unless you explicitly purchase a CA review plan and receive confirmation from a named
        professional, LastMinute ITR is not a chartered accountancy firm. Automated checks and
        companion guides are software assistance, not a formal audit or representation before
        tax authorities.
      </p>
      <h2 className="text-base font-semibold text-foreground">Filing on incometax.gov.in</h2>
      <p>
        You are solely responsible for submitting your return and e-verifying on the official
        portal. We provide numbers and step-by-step guidance; portal validation errors, defective
        returns, or missed deadlines remain your responsibility after you confirm and file.
      </p>
      <h2 className="text-base font-semibold text-foreground">No guaranteed refunds</h2>
      <p>
        Any estimated refund or tax payable shown in the app is illustrative based on your inputs.
        Final tax, refund, or demand is determined only by the Income Tax Department after
        processing. We make no guarantee of refund amount or processing time.
      </p>
      <h2 className="text-base font-semibold text-foreground">Lawful optimization only</h2>
      <p>
        We surface deductions and regimes permitted under Indian income tax law. We do not
        encourage concealment of income, false deductions, or any unlawful tax avoidance.
      </p>
      <h2 className="text-base font-semibold text-foreground">Illustrative reviews</h2>
      <p>
        Some testimonials on our reviews page are illustrative examples. User-submitted reviews
        with ratings of 3 or above may be shown publicly; lower ratings are kept private.
      </p>
    </LegalPageLayout>
  );
}
