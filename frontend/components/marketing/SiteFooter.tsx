import Link from "next/link";
import { PRICING_PLANS, SITE_NAME } from "@/lib/constants";
import { getDisplayPricing, formatPlanPriceLabel } from "@/lib/marketing/pricing";
import { CONTENT_MAX, TYPOGRAPHY_SCALE } from "@/lib/design/layout";
import { FileText, Mail } from "lucide-react";

const SUPPORT_EMAIL = "support@lastminute-itr.com";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-muted/20">
      <div
        className={`mx-auto grid ${CONTENT_MAX} grid-cols-2 gap-x-6 gap-y-5 px-4 py-8 sm:px-6 lg:grid-cols-4 lg:gap-x-8 lg:py-9 xl:px-8`}
      >
        <div className="col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <FileText className="size-3" />
            </span>
            <p className="text-sm font-bold">{SITE_NAME}</p>
          </div>
          <p className={`mt-2 text-muted-foreground ${TYPOGRAPHY_SCALE.caption}`}>
            AI-assisted ITR prep with mismatch and regime checks — you submit on
            incometax.gov.in. Companion mode — we never auto-file for you.
          </p>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <Mail className="size-3.5" />
            {SUPPORT_EMAIL}
          </a>
        </div>
        <div>
          <p className="text-sm font-semibold">Learn</p>
          <ul className={`mt-2 space-y-1.5 text-muted-foreground ${TYPOGRAPHY_SCALE.caption}`}>
            <li>
              <Link href="/blogs" className="transition-colors hover:text-primary">
                Blogs
              </Link>
            </li>
            <li>
              <Link href="/learn" className="transition-colors hover:text-primary">
                Guides
              </Link>
            </li>
            <li>
              <Link href="/glossary" className="transition-colors hover:text-primary">
                Glossary
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Product</p>
          <ul className={`mt-2 space-y-1.5 text-muted-foreground ${TYPOGRAPHY_SCALE.caption}`}>
            <li>
              <Link href="/#pricing" className="transition-colors hover:text-primary">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/reviews" className="transition-colors hover:text-primary">
                Reviews
              </Link>
            </li>
            <li>
              <Link href="/chat" className="transition-colors hover:text-primary">
                Support chat
              </Link>
            </li>
            <li>
              <Link href="/profile" className="transition-colors hover:text-primary">
                Profile
              </Link>
            </li>
            <li>
              <Link href="/file/onboarding/eligibility?step=about-you" className="transition-colors hover:text-primary">
                Start filing
              </Link>
            </li>
          </ul>
        </div>
        <div className="col-span-2 lg:col-span-1">
          <p className="text-sm font-semibold">Legal</p>
          <ul className={`mt-2 space-y-1.5 text-muted-foreground ${TYPOGRAPHY_SCALE.caption}`}>
            <li>
              <Link href="/privacy" className="transition-colors hover:text-primary">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="transition-colors hover:text-primary">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/refund-policy" className="transition-colors hover:text-primary">
                Refund Policy
              </Link>
            </li>
            <li>
              <Link href="/disclaimer" className="transition-colors hover:text-primary">
                Disclaimer
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60 bg-muted/30">
        <div className={`mx-auto ${CONTENT_MAX} px-4 py-4 sm:px-6 lg:px-8`}>
          <details className="group">
            <summary className="cursor-pointer list-none text-tier-legal [&::-webkit-details-marker]:hidden">
              <span className="font-medium text-foreground">Compliance notice</span>
              <span className="ml-1 group-open:hidden">
                — {SITE_NAME} is independently operated; you file on incometax.gov.in.{" "}
                <Link href="/disclaimer" className="text-primary underline">
                  Full disclaimer
                </Link>
              </span>
              <span className="ml-1 hidden group-open:inline text-primary">Hide</span>
            </summary>
            <p className="mt-2 text-tier-legal leading-relaxed">
              {SITE_NAME} is independently operated. We are not a chartered accountancy firm unless
              you purchase an explicit CA review plan. You file and e-verify your return directly on
              the official{" "}
              <a
                href="https://www.incometax.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                incometax.gov.in
              </a>
              . Tax/refund estimates are illustrative — final amounts are determined by ITD. We do
              not guarantee refunds. Your data is handled per our Privacy Policy with reasonable
              security safeguards.{" "}
              <Link href="/disclaimer" className="text-primary underline">
                Read full disclaimer
              </Link>
            </p>
          </details>

          <div
            className={`mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border/40 pt-3 text-muted-foreground ${TYPOGRAPHY_SCALE.caption}`}
          >
            <span className="shrink-0">© {new Date().getFullYear()} {SITE_NAME}</span>
            <nav aria-label="Legal links" className="flex flex-wrap gap-x-3 gap-y-1">
              <Link href="/privacy" className="hover:text-foreground hover:underline">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-foreground hover:underline">
                Terms
              </Link>
              <Link href="/refund-policy" className="hover:text-foreground hover:underline">
                Refunds
              </Link>
              <Link href="/disclaimer" className="hover:text-foreground hover:underline">
                Disclaimer
              </Link>
            </nav>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {PRICING_PLANS.map((plan) => {
                const pricing = getDisplayPricing(plan.id);
                return (
                  <span key={plan.id}>
                    {plan.name}:{" "}
                    {pricing.showOffer && pricing.original !== undefined ? (
                      <>
                        {formatPlanPriceLabel(pricing.current)}{" "}
                        <span className="line-through opacity-70">
                          {formatPlanPriceLabel(pricing.original)}
                        </span>
                      </>
                    ) : (
                      formatPlanPriceLabel(pricing.current)
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
