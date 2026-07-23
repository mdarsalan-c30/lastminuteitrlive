"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useDraftStore } from "@/lib/store/draft";
import { useDraftTaxCompute } from "@/lib/hooks/useDraftTaxCompute";
import { formatINR } from "@/lib/format";
import { FILING_READY } from "@/lib/copy/strings";
import { cn } from "@/lib/utils";
import { getIncomeSectionStatuses, statusDotClass, type IncomeSectionId } from "@/lib/filing/navStatus";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { ProfileNavLink } from "@/components/marketing/ProfileNavLink";
import { ActiveAiCompanion } from "./ActiveAiCompanion";
import { FloatingGenie } from "./FloatingGenie";
import { FilingSessionControls } from "./FilingSessionControls";
import {
  UserCheck,
  UploadCloud,
  Coins,
  CreditCard,
  ExternalLink,
  Menu,
  Calculator,
  X,
  Check,
  ChevronRight,
  HelpCircle,
  BookOpen,
  Wrench,
  LogOut,
  Sparkles,
  UsersRound,
  Lock,
} from "lucide-react";

type SidebarStep = {
  id: string;
  label: string;
  href: string;
  match: string[];
  icon: any;
  subItems?: { id: string; label: string; href: string; statusKey: IncomeSectionId }[];
};

const SIDEBAR_STEPS: SidebarStep[] = [
  { id: "family", label: "Filing For", href: "/file/family", match: ["/file/family"], icon: UsersRound },
  { id: "onboarding", label: "About You", href: "/file/start", match: ["/file/start", "/file/onboarding"], icon: UserCheck },
  { id: "import", label: "Add Documents", href: "/file/import/documents", match: ["/file/import"], icon: UploadCloud },
  {
    id: "review",
    label: "Income & Tax Savings",
    href: "/file/review",
    match: ["/file/review", "/file/comprehensive", "/file/income", "/file/house-property", "/file/other", "/file/deductions"],
    icon: Coins,
    subItems: [
      { id: "salary", label: "Salary Income", href: "/file/income", statusKey: "salary" },
      { id: "house", label: "House Property", href: "/file/house-property", statusKey: "house" },
      { id: "other", label: "Other Income", href: "/file/other", statusKey: "other" },
      { id: "deductions", label: "Deductions", href: "/file/deductions", statusKey: "deductions" },
    ],
  },
  { id: "regime", label: "Compare Tax Option", href: "/file/regime", match: ["/file/regime"], icon: Calculator },
  { id: "advisor", label: "Guided Tax Check", href: "/file/advisor", match: ["/file/advisor", "/file/cabrain"], icon: Sparkles },
  { id: "checkout", label: "Choose a Plan", href: "/file/checkout/plans", match: ["/file/checkout"], icon: CreditCard },
  { id: "companion", label: "File on Tax Portal", href: "/file/companion", match: ["/file/companion", "/file/support"], icon: ExternalLink },
];

const SUMMARY_PATH_PREFIXES = [
  "/file/import",
  "/file/income",
  "/file/house-property",
  "/file/other",
  "/file/deductions",
  "/file/regime",
  "/file/review",
  "/file/checkout",
];

function shouldShowSummaryRail(pathname: string): boolean {
  return SUMMARY_PATH_PREFIXES.some((p) => pathname.startsWith(p));
}

function isStepActive(step: typeof SIDEBAR_STEPS[number], pathname: string, activeNavSection?: string) {
  if (activeNavSection && step.id === activeNavSection) return true;
  return step.match.some((m) => pathname.startsWith(m));
}

function isSubItemActive(subId: string, pathname: string, activeNavSection?: string) {
  if (activeNavSection && subId === activeNavSection) return true;
  if (subId === "salary" && pathname.startsWith("/file/income")) return true;
  if (subId === "house" && pathname.startsWith("/file/house-property")) return true;
  if (subId === "other" && pathname.startsWith("/file/other")) return true;
  if (subId === "deductions" && pathname.startsWith("/file/deductions")) return true;
  return false;
}

function getBreadcrumbs(pathname: string) {
  const parts = [{ label: "Filing Workspace", href: "/file" }];

  if (pathname.startsWith("/file/family")) parts.push({ label: "People I file for", href: "/file/family" });
  else if (pathname.startsWith("/file/start") || pathname.startsWith("/file/onboarding")) parts.push({ label: "Get Started", href: "/file/start" });
  else if (pathname.startsWith("/file/import")) parts.push({ label: "Import Documents", href: "/file/import/documents" });
  else if (pathname.startsWith("/file/comprehensive")) parts.push({ label: "Comprehensive Profile", href: "/file/comprehensive" });
  else if (pathname.startsWith("/file/regime")) parts.push({ label: "Regime Choice", href: "/file/regime" });
  else if (pathname.startsWith("/file/review")) parts.push({ label: "Audit & Review", href: "/file/review" });
  else if (pathname.startsWith("/file/checkout/payment")) {
    parts.push({ label: "Checkout & Plans", href: "/file/checkout/plans" });
    parts.push({ label: "Payment", href: "/file/checkout/payment" });
  } else if (pathname.startsWith("/file/checkout")) parts.push({ label: "Checkout & Plans", href: "/file/checkout/plans" });
  else if (pathname.startsWith("/file/companion")) parts.push({ label: "File on Portal", href: "/file/companion" });

  return parts;
}

export function FilingLayout({
  children,
  showNavRail = false,
  activeNavSection,
  mirrorText = "Government forms use legal terms. We explain each field in plain English so you know what you are declaring.",
  variant = "default",
  noPadding = false,
}: {
  children: ReactNode;
  showNavRail?: boolean;
  activeNavSection?: string;
  mirrorText?: string;
  variant?: "default" | "wide" | "companion";
  noPadding?: boolean;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const draftName = useDraftStore((s) => s.name);
  const regime = useDraftStore((s) => s.regime);
  const income = useDraftStore((s) => s.income);
  const houseProperty = useDraftStore((s) => s.houseProperty);
  const deductions = useDraftStore((s) => s.deductions);
  const incomeChips = useDraftStore((s) => s.incomeChips);
  const connectedConnectors = useDraftStore((s) => s.connectedConnectors);
  const mismatchResolved = useDraftStore((s) => s.mismatchResolved);
  const paymentVerifiedAt = useDraftStore((s) => s.paymentVerifiedAt);
  const isUnlocked = !!paymentVerifiedAt;

  const sectionStatuses = getIncomeSectionStatuses({
    income,
    houseProperty,
    deductions,
    regime,
    incomeChips,
    connectedConnectors,
    mismatchResolved,
  });

  const { loading: taxLoading, result, confidence: taxConfidence } = useDraftTaxCompute({ readOnly: true });

  const selectedRegime = regime ?? result?.regime_comparison.recommended_regime ?? "new";
  const netPayable = result?.regime_comparison[selectedRegime].net_payable ?? null;
  const isRefund = netPayable !== null && netPayable < 0;
  const score = Math.round(taxConfidence.completeness_score);

  function getStepStatus(stepId: string): "complete" | "partial" | "missing" {
    if (stepId === "onboarding") return draftName ? "complete" : "missing";

    if (stepId === "import") {
      return connectedConnectors.includes("form16")
        ? "complete"
        : connectedConnectors.length > 0
          ? "partial"
          : "missing";
    }

    if (stepId === "review") {
      const statuses = [sectionStatuses.salary, sectionStatuses.house, sectionStatuses.other, sectionStatuses.deductions];
      if (statuses.every((s) => s === "complete") && mismatchResolved) return "complete";
      if (statuses.every((s) => s === "missing")) return "missing";
      return "partial";
    }

    if (stepId === "checkout") {
      if (pathname.startsWith("/file/checkout/payment")) return "partial";
      if (pathname.startsWith("/file/checkout")) return "partial";
      return "missing";
    }

    if (stepId === "companion") {
      if (pathname.startsWith("/file/companion")) return "partial";
      if (pathname.startsWith("/file/done") || pathname.startsWith("/file/checkout/everify")) return "complete";
      return "missing";
    }

    return "missing";
  }

  const isCompanionLayout = variant === "companion";
  const isWideLayout = variant === "wide" || isCompanionLayout;
  const breadcrumbs = getBreadcrumbs(pathname);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0e5f63] text-white">
      <div className="flex h-16 shrink-0 items-center px-5 border-b border-white/10 gap-2.5 bg-white">
        <BrandLogo size="xs" variant="icon" />
        <span className="text-lg font-bold tracking-tight text-slate-950">
          LastminuteITR
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-7 scrollbar-thin">
        <div>
          <h1 className="px-3 mb-4 text-sm font-bold uppercase tracking-wide text-white/80">
            Filing Journey
          </h1>

          <ul className="space-y-1">
            {SIDEBAR_STEPS.map((step) => {
              const active = isStepActive(step, pathname, activeNavSection);
              const status = getStepStatus(step.id);
              const Icon = step.icon;
              const hasSubItems = step.subItems && step.subItems.length > 0;

              return (
                <li key={step.id} className="space-y-1">
                  <Link
                    href={step.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all relative group",
                      active
                        ? "bg-white/15 font-semibold text-white shadow-[inset_1px_0_0_rgba(255,255,255,0.18)]"
                        : "text-white/75 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/4 bottom-1/4 w-0.5 rounded bg-white" />
                    )}

                    <Icon className={cn("size-4.5 shrink-0", active ? "text-white" : "text-white/60 group-hover:text-white")} />

                    <span className="flex-1 truncate">{step.label}</span>

                    {status === "complete" ? (
                      <span className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-white text-[#0e5f63] ring-1 ring-white/20">
                        <Check className="size-2.5" strokeWidth={3} />
                      </span>
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-white/30 shrink-0 mr-1.5" />
                    )}
                  </Link>

                  {hasSubItems && active && (
                    <ul className="pl-9 space-y-1 mt-0.5 border-l border-white/10 ml-5">
                      {step.subItems!.map((sub) => {
                        const subActive = isSubItemActive(sub.id, pathname, activeNavSection);
                        const subStatus = sectionStatuses[sub.statusKey];

                        return (
                          <li key={sub.id}>
                            <Link
                              href={sub.href}
                              onClick={() => setIsSidebarOpen(false)}
                              className={cn(
                                "flex items-center justify-between rounded-lg px-2.5 py-2 text-[13px] transition-all",
                                subActive
                                  ? "font-semibold text-white bg-white/15"
                                  : "text-white/65 hover:text-white hover:bg-white/10"
                              )}
                            >
                              <span>{sub.label}</span>
                              <span className={cn("h-1.5 w-1.5 rounded-full", statusDotClass(subStatus))} />
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <h4 className="px-3 mb-3 text-[11px] font-semibold uppercase tracking-wider text-white/55">
            Resources
          </h4>

          <ul className="space-y-1">
            <li>
              <Link href="/help" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-white/75 hover:bg-white/10 hover:text-white">
                <HelpCircle className="size-4.5 text-white/60" />
                <span>Help Center</span>
              </Link>
            </li>
            <li>
              <Link href="/learn" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-white/75 hover:bg-white/10 hover:text-white">
                <BookOpen className="size-4.5 text-white/60" />
                <span>Tax Guides</span>
              </Link>
            </li>
            <li>
              <Link href="/tools" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-white/75 hover:bg-white/10 hover:text-white">
                <Wrench className="size-4.5 text-white/60" />
                <span>Tax Tools</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      <div className="p-4 border-t border-white/10 bg-[#0e5f63] space-y-4">
        {shouldShowSummaryRail(pathname) && (
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Tax Summary
              </span>
              {!taxLoading && score > 0 && <span className="text-xs font-medium text-slate-500">{score}%</span>}
            </div>

            {taxLoading ? (
              <div className="text-sm font-semibold text-slate-600 animate-pulse">Calculating...</div>
            ) : netPayable !== null ? (
              <div className="space-y-1">
                <p className="text-xs text-slate-500">{isRefund ? "Estimated Refund" : "Estimated Tax Due"}</p>
                <div className="relative overflow-hidden">
                  <p
                    className={cn(
                      "text-xl font-bold tracking-tight tabular-nums",
                      !isUnlocked && "blur-md select-none opacity-50",
                      isRefund ? "text-emerald-600" : "text-slate-900"
                    )}
                  >
                    {formatINR(Math.abs(netPayable))}
                  </p>
                  {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-start">
                      <p className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <Lock className="size-4 text-slate-400" />
                        Rs ***
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 leading-normal">Add income details to see tax estimate.</p>
            )}

            <div className="space-y-1.5">
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    taxConfidence.filing_ready ? "bg-emerald-500" : score >= 70 ? "bg-amber-500" : "bg-slate-300"
                  )}
                  style={{ width: `${Math.min(100, score)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>{taxConfidence.filing_ready ? FILING_READY.ready : "Incomplete"}</span>
                {!taxConfidence.filing_ready && (
                  <Link href="/file/import/documents" className="text-[#0e5f63] font-semibold hover:underline">
                    Upload
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center px-2 text-xs">
          <Link href="/" className="flex items-center gap-1.5 font-medium text-white/70 hover:text-white transition-colors">
            <LogOut className="size-3.5" />
            <span>Exit to home</span>
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <aside className="hidden lg:flex lg:flex-col lg:w-56 lg:h-screen lg:sticky lg:top-0 lg:border-r lg:border-slate-100/80 lg:shrink-0">
        {sidebarContent}
      </aside>

      <div className="flex flex-col flex-1 min-w-0 min-h-screen">
        <header className="sticky top-0 z-30 h-16 border-b border-slate-100/60 bg-white/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 focus:outline-none"
              aria-label="Open sidebar"
            >
              <Menu className="size-5" />
            </button>
            <BrandLogo size="xs" variant="icon" href="/" />
          </div>

          <nav className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, i) => (
              <span key={`${crumb.href}-${i}`} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="size-3 text-slate-300" />}
                <Link
                  href={crumb.href}
                  className={cn("hover:text-slate-900 transition-colors", i === breadcrumbs.length - 1 && "font-medium text-slate-800")}
                >
                  {crumb.label}
                </Link>
              </span>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <FilingSessionControls compact />
            </div>
            <Link href="/" className="text-xs font-semibold text-slate-500 hover:text-slate-950 transition-colors hidden sm:block">
              Back to Home
            </Link>
            <ProfileNavLink className="text-xs font-semibold" />
          </div>
        </header>

        <div
          className={cn(
            "grid w-full flex-1 content-start items-start gap-2 min-w-0",
            !noPadding && "p-2 sm:p-3 lg:p-4 pb-[calc(5rem+env(safe-area-inset-bottom,0px))]",
            isWideLayout ? "grid-cols-1" : isCompanionLayout ? "grid-cols-1" : "grid-cols-1 xl:grid-cols-[1fr_20rem] max-w-[90rem] mx-auto"
          )}
        >
          <main
            className={cn(
              "bg-white min-w-0 w-full",
              !noPadding ? "rounded-2xl border border-slate-100/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] p-4 sm:p-5" : "h-full"
            )}
          >
            {children}
          </main>

          {!isWideLayout && (
            <aside className="hidden xl:block w-full shrink-0 self-start xl:sticky xl:top-20 xl:h-[calc(100vh-6rem)] xl:overflow-y-auto">
              <div className="h-full border border-slate-100 bg-white rounded-2xl shadow-sm overflow-hidden">
                <ActiveAiCompanion />
              </div>
            </aside>
          )}
        </div>
      </div>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" />

          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-[#0e5f63] shadow-2xl transition-transform duration-300 ease-in-out">
            <div className="absolute right-4 top-4 z-10">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white focus:outline-none"
                aria-label="Close sidebar"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 h-full">{sidebarContent}</div>
          </div>
        </div>
      )}

      <FloatingGenie desktopHidden={!isCompanionLayout} />
    </div>
  );
}