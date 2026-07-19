"use client";

import Link from "next/link";
import { useScrollNav } from "@/components/motion/useScrollNav";
import { ProfileNavLink } from "@/components/marketing/ProfileNavLink";
import { Sheet, SheetCloseLink, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";

import { BrandLogo } from "@/components/brand/BrandLogo";
import { NavMenu } from "@/components/nav/NavMenu";

const PRODUCTS_LINKS = [
  { href: "/#", label: "Individual Tax Filing" },
  { href: "/#b2b", label: "B2B Model For CAs" },
  { href: "/#pricing", label: "Pricing" },
];

const RESOURCES_LINKS = [
  { href: "/blogs", label: "Blog" },
  { href: "/learn", label: "Filing Guides" },
  { href: "/glossary", label: "Tax Glossary" },
];

const COMPANY_LINKS = [
  { href: "/#about", label: "About Us" },
  { href: "mailto:contact@lastminuteitr.in", label: "Contact/Support" },
];

const MOBILE_EXTRA = [
  ...PRODUCTS_LINKS,
  ...RESOURCES_LINKS,
  ...COMPANY_LINKS,
];

export function SiteHeader() {
  const { scrolled } = useScrollNav();

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-all duration-300",
        scrolled
          ? "border-[#E6E8EC] bg-[rgba(250,250,251,0.92)] shadow-[0_1px_0_rgba(12,18,34,0.06)] backdrop-blur-[14px] saturate-150"
          : "border-[#E6E8EC]/60 bg-[rgba(250,250,251,0.70)] backdrop-blur-md"
      )}
    >
      <div className="bg-[#0e5f63] text-white text-center py-2 px-4 text-sm font-medium tracking-wide">
        Platform is now Live! Only 12 days left to file your ITR penalty-free (July 31st deadline)
      </div>
      <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-8 h-[72px] max-[560px]:h-[64px] max-[560px]:px-5">
        <BrandLogo variant="wordmark" size="sm" priority />

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-9 lg:flex" aria-label="Main navigation">
          <NavMenu label="Products" items={PRODUCTS_LINKS} triggerClassName="text-[14.5px] font-medium text-[#2B3344] hover:text-[#0e5f63]" />
          <NavMenu label="Resources" items={RESOURCES_LINKS} triggerClassName="text-[14.5px] font-medium text-[#2B3344] hover:text-[#0e5f63]" />
          <NavMenu label="Company" items={COMPANY_LINKS} triggerClassName="text-[14.5px] font-medium text-[#2B3344] hover:text-[#0e5f63]" />
          <Link href="/blogs" className="text-[14.5px] font-medium text-[#2B3344] hover:text-[#0e5f63]">Blog</Link>
        </nav>

        {/* CTA cluster */}
        <div className="flex items-center gap-3.5">
          <ProfileNavLink className="hidden sm:flex" />
          {/*
            Desktop-only CTAs. Visibility is controlled by THIS wrapper, not the
            pills themselves: `.btn-pill-*` hard-set `display: inline-flex` in
            globals.css, which has equal specificity to Tailwind's `hidden` and
            wins the cascade — so `hidden` on the links is a no-op. A wrapper
            with `display: none` removes the children regardless. Below `lg`
            these collapse into the hamburger sheet.
          */}
          <div className="hidden items-center gap-3.5 lg:flex">
            <Link
              href="/file/import/documents?source=form16"
              className="btn-pill-secondary py-[10px] px-5 text-[14px]"
            >
              Upload Form 16
            </Link>
            <Link
              href="/#b2c-name"
              className="btn-pill-primary py-[10px] px-5 text-[14px]"
            >
              Start my return
            </Link>
          </div>
          {/* Mobile hamburger */}
          <Sheet>
            <SheetTrigger
              className="flex size-9 items-center justify-center rounded-lg border border-[#E6E8EC] bg-white text-[#0B1220] transition hover:bg-[#F3F4F7] lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-[18px]" aria-hidden />
            </SheetTrigger>
            <SheetContent side="right" className="p-0">
              <nav className="flex flex-col gap-0.5 p-4" aria-label="Mobile navigation">
                {MOBILE_EXTRA.map((item) => (
                  <SheetCloseLink
                    key={item.href}
                    href={item.href}
                    className="min-h-10 rounded-md px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
                  >
                    {item.label}
                  </SheetCloseLink>
                ))}
                <div className="mt-3 flex flex-col gap-2.5 border-t border-border/60 pt-3">
                  <SheetCloseLink
                    href="/#b2c-name"
                    className="btn-pill-primary block w-full text-center py-3"
                  >
                    Start my return
                  </SheetCloseLink>
                  <SheetCloseLink
                    href="/file/import/documents?source=form16"
                    className="btn-pill-secondary block w-full text-center py-3"
                  >
                    Upload Form 16
                  </SheetCloseLink>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
