"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { FilingSummaryRail } from "./FilingSummaryRail";
import { ProductProcessFlow } from "./ProductProcessFlow";
import { NavMenu } from "@/components/nav/NavMenu";
import { ProfileNavLink } from "@/components/marketing/ProfileNavLink";
import {
  getIncomeSectionStatuses,
  statusDotClass,
  type IncomeSectionId,
} from "@/lib/filing/navStatus";
import { useDraftStore } from "@/lib/store/draft";
import {
  ClipboardCheck,
  CreditCard,
  FileText,
  Upload,
} from "lucide-react";

const NAV_SECTIONS: {
  id: IncomeSectionId;
  label: string;
  href: string;
}[] = [
  { id: "salary", label: "Salary", href: "/file/income" },
  { id: "house", label: "House property", href: "/file/house-property" },
  { id: "other", label: "Other sources", href: "/file/other" },
  { id: "deductions", label: "Deductions", href: "/file/deductions" },
  { id: "regime", label: "Regime", href: "/file/regime" },
];

const BASE_FILE_NAV_MATCH = [
  "/file/onboarding",
  "/file/income",
  "/file/house-property",
  "/file/other",
  "/file/deductions",
  "/file/regime",
] as const;

const FILING_NAV_TRIGGER =
  "rounded-md px-2.5 py-1.5 text-[13px] font-medium leading-none text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 md:px-3 md:text-sm";

const FILING_RESOURCE_ITEMS = [
  { href: "/help", label: "Help" },
  { href: "/learn", label: "Learn" },
  { href: "/tools", label: "Tools" },
  { href: "/glossary", label: "Glossary" },
  { href: "/", label: "Exit to homepage" },
] as const;

const MOBILE_TABS = [
  {
    label: "File",
    href: "/file/onboarding/eligibility?step=about-you",
    match: BASE_FILE_NAV_MATCH,
    icon: FileText,
  },
  {
    label: "Import",
    href: "/file/import/documents",
    match: ["/file/import"],
    icon: Upload,
  },
  {
    label: "Review",
    href: "/file/review",
    match: ["/file/review"],
    icon: ClipboardCheck,
  },
  {
    label: "Pay",
    href: "/file/checkout/plans",
    match: ["/file/checkout", "/file/companion"],
    icon: CreditCard,
  },
] as const;

const DEFAULT_MIRROR_TEXT =
  "Government forms use legal terms. We explain each field in plain English so you know what you are declaring.";

function getMirrorFallback(pathname: string) {
  if (pathname.startsWith("/file/onboarding")) {
    return "Your identity and income details decide which ITR form is valid. Getting this right now prevents notices and rework later.";
  }
  if (pathname.startsWith("/file/import")) {
    return "Imported numbers should match your source documents and AIS/26AS. Confirm now to avoid mismatch notices at filing time.";
  }
  if (pathname.startsWith("/file/review")) {
    return "This is your final risk check before submission. Resolve flagged mismatches now for faster refunds and fewer notices.";
  }
  if (pathname.startsWith("/file/checkout") || pathname.startsWith("/file/companion")) {
    return "You still file on incometax.gov.in. This guide helps you submit correctly and keep a complete audit trail.";
  }
  return DEFAULT_MIRROR_TEXT;
}

function isNavActive(pathname: string, match: readonly string[]) {
  return match.some((m) => pathname.startsWith(m));
}

export function FilingLayout({
  children,
  showNavRail = false,
  activeNavSection,
  mirrorText = "Government forms use legal terms. We explain each field in plain English so you know what you are declaring.",
  variant = "default",
}: {
  children: ReactNode;
  showNavRail?: boolean;
  activeNavSection?: string;
  mirrorText?: string;
  /** wide: full content width; companion: wide + hide right mirror aside */
  variant?: "default" | "wide" | "companion";
}) {
  const pathname = usePathname();
  const filingPath = useDraftStore((s) => s.filingPath);
  const recommendationCount = useDraftStore((s) => s.engineRecommendationCount);
  const income = useDraftStore((s) => s.income);
  const houseProperty = useDraftStore((s) => s.houseProperty);
  const deductions = useDraftStore((s) => s.deductions);
  const regime = useDraftStore((s) => s.regime);
  const incomeChips = useDraftStore((s) => s.incomeChips);
  const connectedConnectors = useDraftStore((s) => s.connectedConnectors);
  const mismatchResolved = useDraftStore((s) => s.mismatchResolved);
  const sectionStatuses = getIncomeSectionStatuses({
    income,
    houseProperty,
    deductions,
    regime,
    incomeChips,
    connectedConnectors,
    mismatchResolved,
  });
  const fileNavMatch =
    filingPath === "cabrain"
      ? [...BASE_FILE_NAV_MATCH, "/file/cabrain"]
      : [...BASE_FILE_NAV_MATCH];
  const safeMirrorText =
    mirrorText?.trim() || getMirrorFallback(pathname) || DEFAULT_MIRROR_TEXT;
  const isCompanionLayout = variant === "companion";
  const isWideLayout = variant === "wide" || isCompanionLayout;
  const contentGridClass = showNavRail
    ? "lg:grid-cols-[14rem_minmax(0,1fr)] xl:grid-cols-[14rem_minmax(0,1fr)_18rem]"
    : isCompanionLayout
      ? "lg:grid-cols-[minmax(0,1fr)]"
      : "lg:grid-cols-[minmax(0,1fr)] xl:grid-cols-[minmax(0,1fr)_18rem]";
  const mainShellClass = isWideLayout
    ? "filing-page-shell filing-page-shell--wide filing-content-pad min-w-0 self-start"
    : "filing-page-shell filing-content-pad min-w-0 self-start";

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 shadow-[0_1px_0_rgba(12,18,34,0.03)] backdrop-blur-2xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-14 min-w-0 items-center justify-between gap-3 sm:gap-6">
            <Link href="/" className="flex min-w-0 shrink items-center gap-2">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm sm:size-8 sm:rounded-xl">
                <FileText className="size-3.5 sm:size-4" aria-hidden />
              </span>
              <span className="hidden truncate text-sm font-semibold tracking-tight text-slate-900 sm:inline">
                LastMinute ITR
              </span>
            </Link>

            <div className="flex shrink-0 items-center gap-0.5 sm:gap-1.5">
              <Link
                href="/file/review"
                data-active={isNavActive(pathname, ["/file/review"])}
                className="filing-nav-link hidden items-center gap-1.5 md:inline-flex"
              >
                Review
                {recommendationCount > 0 && (
                  <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                    {recommendationCount}
                  </span>
                )}
              </Link>
              <NavMenu
                label="Resources"
                items={FILING_RESOURCE_ITEMS}
                triggerClassName={FILING_NAV_TRIGGER}
              />
              <ProfileNavLink className="ml-0.5 hidden sm:flex" />
            </div>
          </div>

          <div className="hidden border-t border-slate-100/90 pb-2.5 pt-2 md:block">
            <ProductProcessFlow />
          </div>

          <div className="border-t border-slate-100/90 pb-2 pt-2 md:hidden">
            <ProductProcessFlow scroll />
          </div>
        </div>
        <FilingSummaryRail />
      </header>

      <div
        className={`mx-auto grid w-full max-w-6xl min-w-0 flex-1 content-start items-start gap-4 px-4 py-3 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] sm:gap-4 sm:px-6 md:py-4 md:pb-8 lg:max-w-7xl ${contentGridClass}`}
      >
        {showNavRail && (
          <nav className="hidden w-56 shrink-0 lg:block">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
              Income sections
            </h4>
            <ul className="space-y-1">
              {NAV_SECTIONS.map((section) => (
                <li key={section.id}>
                  <Link
                    href={section.href}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all ${
                      activeNavSection === section.id
                        ? "bg-blue-50 font-semibold text-blue-700 shadow-sm"
                        : "text-slate-600 hover:bg-white hover:shadow-sm"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${statusDotClass(sectionStatuses[section.id])}`}
                      title={sectionStatuses[section.id]}
                    />
                    {section.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <main className={mainShellClass}>
          {children}
        </main>

        {/* Companion screens render their own contextual rail, so we skip the
            shared mirror entirely there to avoid a duplicate "What this means"
            heading in the DOM. */}
        {!isCompanionLayout && (
          <aside className="hidden w-72 shrink-0 self-start xl:block">
            <div className="sticky top-[7.25rem] card-premium p-5">
              <h4 className="mb-2 text-sm font-semibold text-slate-900">
                What this means
              </h4>
              <p className="text-sm leading-relaxed text-slate-600">{safeMirrorText}</p>
            </div>
          </aside>
        )}
      </div>

      <nav className="filing-tab-bar" aria-label="Filing sections">
        {MOBILE_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = isNavActive(
            pathname,
            tab.label === "File" ? fileNavMatch : tab.match
          );
          return (
            <Link
              key={tab.label}
              href={tab.href}
              data-active={active}
              className="filing-tab-link hover:text-foreground"
            >
              <span className="filing-tab-icon">
                <Icon aria-hidden />
              </span>
              <span className="inline-flex items-center gap-0.5">
                {tab.label}
                {tab.label === "Pay" && recommendationCount > 0 && (
                  <span className="inline-flex min-w-4 items-center justify-center rounded-full bg-emerald-100 px-1 py-px text-[9px] font-semibold leading-none text-emerald-700">
                    {recommendationCount}
                  </span>
                )}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
