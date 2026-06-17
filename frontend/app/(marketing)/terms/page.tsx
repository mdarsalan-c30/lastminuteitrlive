import Link from "next/link";
import { LegalPageLayout } from "@/components/marketing/LegalPageLayout";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

const SUPPORT_EMAIL = "support@lastminute-itr.com";

export const metadata: Metadata = pageMetadata({
  title: "Terms & Conditions",
  description:
    "Terms & Conditions for LastMinute ITR — a companion tool that helps Indian taxpayers prepare returns and file themselves on incometax.gov.in.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms & Conditions" lastUpdated="10 June 2026">
      <p>
        These Terms &amp; Conditions (&quot;Terms&quot;) govern your use of LastMinute ITR
        (&quot;LastMinute ITR&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;), a software
        service that helps individual taxpayers in India prepare their income tax returns and file
        them themselves on the official Income Tax Department portal at{" "}
        <a
          href="https://www.incometax.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline"
        >
          incometax.gov.in
        </a>
        . By accessing or using the service, you agree to these Terms. If you do not agree, do not
        use the service.
      </p>

      <h2>1. What LastMinute ITR is — and is not</h2>
      <ul>
        <li>
          We are an <strong>independent software companion</strong>.
          We help you import documents, compute tax, compare the old and new regimes, catch
          mismatches, and follow a step-by-step guide to file on the government portal.
        </li>
        <li>
          We are <strong>not affiliated with, endorsed by, or operated by</strong> the Income Tax
          Department, the Central Board of Direct Taxes (CBDT), or any government authority.
        </li>
        <li>
          We are <strong>not a chartered accountancy firm</strong> and
          do not provide chartered accountant (CA) services by default. CA review is provided only
          if you purchase a CA review plan and receive confirmation from a named professional.
        </li>
        <li>
          Our outputs are software assistance, not a formal audit, certification, or representation
          before any tax authority.
        </li>
      </ul>

      <h2>2. We do not file for you</h2>
      <p>
        LastMinute ITR operates in <strong>companion mode</strong>. We
        prepare your figures and guide each screen, but{" "}
        <strong>we never auto-submit or file your return with the Income Tax Department</strong>.
        You copy your values into incometax.gov.in and submit and e-verify the return yourself,
        unless a separate written agreement for a specific service states otherwise.
      </p>

      <h2>3. Estimates only — no guaranteed refund</h2>
      <p>
        Any tax, refund, or amount payable shown in the app is an <strong>illustrative estimate</strong> based on the information
        you provide and tax law as understood at build time. Final tax, refund, demand, interest,
        or penalty is determined solely by the Income Tax Department after it processes your return.
        We make <strong>no guarantee</strong> of any refund amount, refund eligibility, or
        processing time.
      </p>

      <h2>4. Not tax advice</h2>
      <p>
        Information and computations in the app are general in nature and are not a substitute for
        personalised advice from a qualified chartered accountant or tax professional where your
        facts are complex. You are responsible for deciding whether your situation needs
        professional advice.
      </p>

      <h2>5. Your responsibilities</h2>
      <ul>
        <li>Provide accurate, complete, and lawful information.</li>
        <li>
          <strong>Review and confirm all final figures yourself</strong>{" "}
          before entering them on the portal. You are responsible for the correctness of what you
          file.
        </li>
        <li>File and e-verify on incometax.gov.in within statutory deadlines.</li>
        <li>Keep your own copies of acknowledgments and supporting documents.</li>
        <li>Keep your account and device secure; you are responsible for activity under your account.</li>
      </ul>

      <h2>6. Lawful use only</h2>
      <p>
        We surface deductions, exemptions, and regime choices permitted under Indian income tax law.
        You agree not to use the service to conceal income, claim false deductions, or attempt any
        unlawful tax evasion. You may not misuse, reverse engineer, scrape, resell, or disrupt the
        service.
      </p>

      <h2>7. Plans, payments &amp; taxes</h2>
      <ul>
        <li>Paid plans unlock the features described at checkout for a single assessment year.</li>
        <li>
          Prices are in Indian Rupees and are inclusive of applicable taxes (e.g. GST) unless stated
          otherwise at checkout.
        </li>
        <li>
          Payments are processed by our payment partner (Razorpay). We do not store your card, UPI,
          or bank credentials.
        </li>
        <li>
          The CA review plan, where offered, depends on professional availability and stated
          turnaround times and may be released progressively.
        </li>
      </ul>

      <h2>8. Refunds &amp; cancellation</h2>
      <p>
        Refunds for paid LastMinute ITR plans are governed by our{" "}
        <Link href="/refund-policy" className="text-primary underline">
          Refund Policy
        </Link>
        . Refunds of tax from the Income Tax Department are separate and outside our control.
      </p>

      <h2>9. Third-party services</h2>
      <p>
        The service links to and depends on third parties, including incometax.gov.in and Razorpay.
        We are not responsible for portal outages, downtime, validation errors, defective-return
        notices, or any third-party service&apos;s availability, accuracy, or terms.
      </p>

      <h2>10. Data protection</h2>
      <p>
        Our handling of your personal data, including under the Digital Personal Data Protection Act,
        2023 (DPDP Act), is described in our{" "}
        <Link href="/privacy" className="text-primary underline">
          Privacy Policy
        </Link>
        . By using the service you consent to processing of your data as described there.
      </p>

      <h2>11. Intellectual property</h2>
      <p>
        The software, content, and brand are owned by us or our licensors. You retain ownership of
        the data and documents you upload. You grant us a limited licence to process that data solely
        to provide the service to you.
      </p>

      <h2>12. Disclaimers</h2>
      <p>
        The service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of
        any kind. Additional important disclaimers are set out in our{" "}
        <Link href="/disclaimer" className="text-primary underline">
          Disclaimer
        </Link>
        .
      </p>

      <h2>13. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, we are not liable for any penalties, interest,
        notices, demands, lost refunds, or indirect, incidental, or consequential losses arising
        from: data you entered, your final filing decisions, portal outages or errors, changes in
        tax law after your filing date, or events outside our reasonable control. Where liability
        cannot be excluded, our total liability to you is limited to the amount you paid us for the
        relevant plan in the applicable assessment year.
      </p>

      <h2>14. Indemnity</h2>
      <p>
        You agree to indemnify us against claims, losses, and costs arising from your breach of these
        Terms, your misuse of the service, or inaccurate or unlawful information you submit.
      </p>

      <h2>15. Changes &amp; termination</h2>
      <p>
        We may update the service and these Terms from time to time; the &quot;last updated&quot;
        date above reflects the current version. Continued use after changes means you accept the
        updated Terms. We may suspend or terminate access for breach of these Terms or misuse of the
        service.
      </p>

      <h2>16. Governing law &amp; jurisdiction</h2>
      <p>
        These Terms are governed by the laws of India. Disputes are subject to the exclusive
        jurisdiction of the competent courts in India.
      </p>

      <h2>17. Contact</h2>
      <p>
        Questions about these Terms:{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary underline">
          {SUPPORT_EMAIL}
        </a>
      </p>
    </LegalPageLayout>
  );
}
