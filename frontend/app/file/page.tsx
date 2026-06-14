"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDraftStore } from "@/lib/store/draft";
import { Button, FilingActions } from "@/components/filing/ui";
import { Shield } from "lucide-react";
import { FILING_START } from "@/lib/copy/filing";
import {
  applySalariedFastPathDefaults,
  buildDocumentsFastPathUrl,
  isForm16FastPath,
} from "@/lib/filing/routes";

function FileWelcomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { name, setName, setFilingMode, setFilingPath, ensureIncomeChip, setItrConfirmed } =
    useDraftStore();

  useEffect(() => {
    const landingName = searchParams.get("name");
    const welcome = searchParams.get("welcome");

    if (isForm16FastPath(searchParams)) {
      applySalariedFastPathDefaults(
        { setName, setFilingMode, setFilingPath, ensureIncomeChip, setItrConfirmed },
        landingName
      );
      router.replace(buildDocumentsFastPathUrl(landingName));
      return;
    }

    if (welcome !== "1") {
      applySalariedFastPathDefaults(
        { setName, setFilingMode, setFilingPath, ensureIncomeChip, setItrConfirmed },
        landingName
      );
      router.replace(buildDocumentsFastPathUrl(landingName));
      return;
    }

    if (landingName) {
      setName(landingName);
      setFilingMode("estimate");
      router.replace(
        `/file/onboarding/eligibility?step=about-you&name=${encodeURIComponent(landingName)}`
      );
    }
  }, [
    searchParams,
    setName,
    setFilingMode,
    setFilingPath,
    ensureIncomeChip,
    setItrConfirmed,
    router,
  ]);

  return (
    <div className="hero-mesh relative min-h-screen">
      <div className="relative mx-auto max-w-md px-4 py-16 md:py-24">
        <div className="card-premium card-glow p-8">
          <p className="text-sm font-semibold text-primary">LastMinute ITR</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {name ? FILING_START.welcomeBack(name) : FILING_START.headline}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            {FILING_START.subtitle}
          </p>

          <p className="mt-6 inline-flex items-center gap-2 text-xs text-slate-500">
            <Shield className="size-3.5 text-primary" />
            {FILING_START.trustLine}
          </p>

          <FilingActions className="mt-8">
            <Button href="/file/import/documents?source=form16" className="w-full">
              Upload Form 16
            </Button>
            <Button href="/file/onboarding/eligibility?step=about-you" variant="secondary" className="w-full">
              {FILING_START.primaryCta}
            </Button>
            <Button href="/file/companion?demo=1" variant="ghost" className="w-full">
              {FILING_START.secondaryCta}
            </Button>
          </FilingActions>

          <p className="mt-6 text-xs leading-relaxed text-slate-400">
            By continuing you agree to secure use of tax documents for ITR preparation.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background text-slate-600">
          Loading…
        </div>
      }
    >
      <FileWelcomePage />
    </Suspense>
  );
}
