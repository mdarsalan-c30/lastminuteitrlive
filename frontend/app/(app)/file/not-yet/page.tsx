"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FilingLayout } from "@/components/filing/FilingLayout";
import { Button } from "@/components/filing/ui";
import { SITE_DISCLAIMER } from "@/lib/seo/marketingDisclaimers";

/**
 * BLOCKED — honest exit (doc 40 / doc 21).
 * Never a paywall, chatbot, or retry-loop.
 */
function NotYetContent() {
  const searchParams = useSearchParams();
  const form = searchParams.get("form") ?? "ITR-2";
  const reason =
    searchParams.get("reason") ??
    "Your case needs schedules we do not support end-to-end yet.";

  return (
    <FilingLayout mirrorText="We would rather send you to the right place than file the wrong form.">
      <div className="mx-auto max-w-xl space-y-6 rounded-3xl border border-amber-100 bg-white p-6 shadow-sm md:p-8">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
            Honest exit
          </p>
          <h1 className="text-2xl font-bold text-slate-900">
            We can&apos;t file your case correctly yet — and we won&apos;t pretend.
          </h1>
          <p className="text-sm leading-relaxed text-slate-600">{reason}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-800">
            You likely need <span className="text-blue-700">{form}</span>
          </p>
          <p className="mt-1 text-xs text-slate-600">
            File on the Income Tax Department portal, or ask a Chartered Accountant
            to review with your Form 16 and AIS.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href="https://www.incometax.gov.in/iec/foportal/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white"
          >
            Open ITD portal
          </a>
          <Button href="/file/start" variant="outline" className="flex-1">
            Change my answers
          </Button>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
          <p className="text-sm font-semibold text-slate-800">Talk to a CA</p>
          <p className="mt-1 text-xs text-slate-600">
            Email{" "}
            <a
              className="font-medium text-blue-700 underline"
              href="mailto:ca@lastminuteitr.com?subject=Complex%20ITR%20help"
            >
              ca@lastminuteitr.com
            </a>{" "}
            with your recommended form ({form}) — we route complex cases, we do not
            spam leads.
          </p>
        </div>

        <p className="text-[11px] leading-relaxed text-slate-500">{SITE_DISCLAIMER}</p>
      </div>
    </FilingLayout>
  );
}

export default function NotYetPage() {
  return (
    <Suspense fallback={<div className="p-12 text-slate-600">Loading…</div>}>
      <NotYetContent />
    </Suspense>
  );
}
