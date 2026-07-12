import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { PRICING_PLANS, SITE_NAME } from "@/lib/constants";
import { getDisplayPricing, formatPlanPriceLabel } from "@/lib/marketing/pricing";
import { prisma } from "@/lib/prisma";

const SUPPORT_EMAIL = "support@lastminute-itr.com";

export async function SiteFooter() {
  const dbLinks = await prisma.footerLink.findMany({
    orderBy: { order: "asc" }
  });

  const getLinksForSection = (section: string) => dbLinks.filter(l => l.section === section);
  const learnLinks = getLinksForSection("Learn");
  const productLinks = getLinksForSection("Product");
  const legalLinks = getLinksForSection("Legal");

  return (
    <footer className="border-t border-[#E6E8EC]" style={{ paddingTop: 64, paddingBottom: 32 }}>
      <div className="mx-auto max-w-[1180px] px-8 max-[560px]:px-5">
        {/* 4-col grid */}
        <div className="grid gap-10 mb-12 lg:grid-cols-[1.6fr_1fr_1fr_1fr] md:grid-cols-2">
          {/* Brand */}
          <div>
            <BrandLogo href="/" variant="wordmark" size="sm" />
            <p className="mt-4 mb-4 text-[13.5px] text-[#6B7280] leading-[1.6] max-w-[280px]">
              AI-assisted ITR prep with mismatch and regime checks — you submit on incometax.gov.in.
              Companion mode: we never auto-file for you.
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="inline-flex items-center gap-1.5 text-[13.5px] text-[#0e5f63] hover:underline"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                <rect x="1.5" y="3" width="13" height="10" rx="1.5" stroke="#0e5f63" strokeWidth="1.2"/>
                <path d="M2 4l6 5 6-5" stroke="#0e5f63" strokeWidth="1.2"/>
              </svg>
              {SUPPORT_EMAIL}
            </a>
          </div>

          {/* Learn */}
          <div>
            <h5 className="mb-4 text-[13px] font-bold uppercase tracking-[0.04em] text-[#6B7280]">Learn</h5>
            <ul className="space-y-2.5 text-[14px] text-[#2B3344]">
              {learnLinks.length > 0 ? learnLinks.map(link => (
                <li key={link.id}>
                  <Link href={link.href} target={link.isExternal ? "_blank" : undefined} className="hover:text-[#0e5f63] transition-colors">{link.label}</Link>
                </li>
              )) : (
                <>
                  <li><Link href="/blogs" className="hover:text-[#0e5f63] transition-colors">Blogs</Link></li>
                  <li><Link href="/learn" className="hover:text-[#0e5f63] transition-colors">Guides</Link></li>
                  <li><Link href="/glossary" className="hover:text-[#0e5f63] transition-colors">Glossary</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Product */}
          <div>
            <h5 className="mb-4 text-[13px] font-bold uppercase tracking-[0.04em] text-[#6B7280]">Product</h5>
            <ul className="space-y-2.5 text-[14px] text-[#2B3344]">
              {productLinks.length > 0 ? productLinks.map(link => (
                <li key={link.id}>
                  <Link href={link.href} target={link.isExternal ? "_blank" : undefined} className="hover:text-[#0e5f63] transition-colors">{link.label}</Link>
                </li>
              )) : (
                <>
                  <li><Link href="/#pricing" className="hover:text-[#0e5f63] transition-colors">Pricing</Link></li>
                  <li><Link href="/reviews" className="hover:text-[#0e5f63] transition-colors">Reviews</Link></li>
                  <li><Link href="/chat" className="hover:text-[#0e5f63] transition-colors">Support chat</Link></li>
                  <li><Link href="/file/onboarding/eligibility?step=about-you" className="hover:text-[#0e5f63] transition-colors">Start filing</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h5 className="mb-4 text-[13px] font-bold uppercase tracking-[0.04em] text-[#6B7280]">Legal</h5>
            <ul className="space-y-2.5 text-[14px] text-[#2B3344]">
              {legalLinks.length > 0 ? legalLinks.map(link => (
                <li key={link.id}>
                  <Link href={link.href} target={link.isExternal ? "_blank" : undefined} className="hover:text-[#0e5f63] transition-colors">{link.label}</Link>
                </li>
              )) : (
                <>
                  <li><Link href="/privacy" className="hover:text-[#0e5f63] transition-colors">Privacy policy</Link></li>
                  <li><Link href="/terms" className="hover:text-[#0e5f63] transition-colors">Terms of service</Link></li>
                  <li><Link href="/refund-policy" className="hover:text-[#0e5f63] transition-colors">Refund policy</Link></li>
                  <li><Link href="/disclaimer" className="hover:text-[#0e5f63] transition-colors">Disclaimer</Link></li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Compliance box */}
        <div
          className="mb-6 rounded-[10px] px-5 py-4 text-[12.5px] text-[#6B7280] leading-[1.6]"
          style={{ background: "#F3F4F7" }}
        >
          <strong className="text-[#2B3344]">Compliance notice —</strong>{" "}
          {SITE_NAME} is independently operated; you file on incometax.gov.in.{" "}
          <Link href="/disclaimer" className="text-[#0e5f63] underline">
            Full disclaimer
          </Link>
        </div>

        {/* Footer bottom */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E6E8EC] pt-6 text-[12.5px] text-[#9CA3AF]"
        >
          <span>© {new Date().getFullYear()} {SITE_NAME}</span>
          <span className="flex flex-wrap gap-x-4 gap-y-1">
            <Link href="/privacy" className="hover:text-[#6B7280]">Privacy</Link>
            <Link href="/terms" className="hover:text-[#6B7280]">Terms</Link>
            <Link href="/refund-policy" className="hover:text-[#6B7280]">Refunds</Link>
            <Link href="/disclaimer" className="hover:text-[#6B7280]">Disclaimer</Link>
          </span>
          <span className="flex flex-wrap gap-x-3 gap-y-1">
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
          </span>
        </div>
      </div>
    </footer>
  );
}
