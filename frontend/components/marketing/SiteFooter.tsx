"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { PRICING_PLANS, SITE_NAME } from "@/lib/constants";
import { getDisplayPricing, formatPlanPriceLabel } from "@/lib/marketing/pricing";

const SUPPORT_EMAIL = "contact@lastminuteitr.in";

interface FooterLinkData {
  id: string;
  label: string;
  href: string;
  section: string;
  isExternal: boolean;
}

export function SiteFooter() {
  const [dbLinks, setDbLinks] = useState<FooterLinkData[]>([]);

  useEffect(() => {
    fetch("/api/public/footer")
      .then((res) => res.json())
      .then((data) => {
        if (data.links) {
          setDbLinks(data.links);
        }
      })
      .catch((err) => console.error("Failed to load footer links:", err));
  }, []);

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
            <BrandLogo href="/" variant="full" size="sm" />
            <p className="mt-4 mb-4 text-[13.5px] text-[#6B7280] leading-[1.6] max-w-[280px]">
              <strong className="text-[#2B3344] block mb-1">LastminuteITR — Filing in 10 Min</strong>
              AI-assisted ITR prep with mismatch and regime checks — you submit on incometax.gov.in.
              Companion mode: we never auto-file for you.
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="inline-flex items-center gap-1.5 text-[13.5px] text-[#0e5f63] hover:underline mb-4"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                <rect x="1.5" y="3" width="13" height="10" rx="1.5" stroke="#0e5f63" strokeWidth="1.2"/>
                <path d="M2 4l6 5 6-5" stroke="#0e5f63" strokeWidth="1.2"/>
              </svg>
              {SUPPORT_EMAIL}
            </a>

            <div className="flex items-center gap-4 text-[#6B7280]">
              <a href="https://www.linkedin.com/company/lastminuteitr/" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="hover:text-[#0e5f63] transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/lastminuteitr/" target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:text-[#0e5f63] transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
              <a href="https://x.com/lastminuteitr" target="_blank" rel="noreferrer" aria-label="X" className="hover:text-[#0e5f63] transition-colors">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
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
                  <li><a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-[#0e5f63] transition-colors">Support</a></li>
                  <li><Link href="/file/onboarding/eligibility?step=about-you" className="hover:text-[#0e5f63] transition-colors">Start filing</Link></li>
                  <li><Link href="/admin/pages" className="hover:text-[#0e5f63] transition-colors">Admin Panel</Link></li>
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
          <div className="mt-2 text-[12.5px]">
            <strong>GSTIN:</strong> 27BOHPA6051D1ZD
          </div>
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
