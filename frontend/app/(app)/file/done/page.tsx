"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, Clock, AlertTriangle } from "lucide-react";
import { FilingLayout } from "@/components/filing/FilingLayout";
import { Button } from "@/components/filing/ui";
import { Input } from "@/components/ui/input";
import {
  deriveFilingOutcomeStatus,
  EVERIFY_WINDOW_MS,
  useDraftStore,
} from "@/lib/store/draft";
import { REFERRAL_REFERRER_COPY } from "@/lib/seo/referralEconomics";
import { SITE_DISCLAIMER } from "@/lib/seo/marketingDisclaimers";

/**
 * FILED / VERIFIED / LAPSED — retention loop (doc 21 §4, doc 40).
 * V1: manual acknowledgement entry + e-verify reminder (no portal scraping).
 */
function DoneContent() {
  const searchParams = useSearchParams();
  const filingOutcome = useDraftStore((s) => s.filingOutcome);
  const markReturnEVerified = useDraftStore((s) => s.markReturnEVerified);
  const setFilingOutcome = useDraftStore((s) => s.setFilingOutcome);
  const [ackDraft, setAckDraft] = useState(filingOutcome.acknowledgementNumber);

  const status = useMemo(() => {
    const forced = searchParams.get("status");
    if (forced === "verified" || forced === "lapsed" || forced === "filed") {
      return forced;
    }
    return deriveFilingOutcomeStatus(filingOutcome, Date.now());
  }, [filingOutcome, searchParams]);

  const daysLeft = useMemo(() => {
    if (!filingOutcome.submittedAt) return 30;
    const elapsed = Date.now() - filingOutcome.submittedAt;
    return Math.max(0, Math.ceil((EVERIFY_WINDOW_MS - elapsed) / (24 * 60 * 60 * 1000)));
  }, [filingOutcome.submittedAt]);

  if (status === "none") {
    return (
      <FilingLayout mirrorText="Mark your return as submitted when you have an acknowledgement number from the portal.">
        <div className="mx-auto max-w-lg space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Not submitted yet</h1>
          <p className="text-sm text-slate-600">
            Finish the portal companion, then enter your acknowledgement number to
            start the e-verify countdown.
          </p>
          <Button href="/file/companion">Open portal companion</Button>
        </div>
      </FilingLayout>
    );
  }

  if (status === "verified") {
    return (
      <FilingLayout mirrorText="You are done for this year — refunds usually land in 2–5 weeks after e-verify.">
        <div className="mx-auto max-w-lg space-y-5 rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-emerald-100 p-2">
              <Check className="size-6 text-emerald-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">E-verified</h1>
              <p className="mt-1 text-sm text-slate-600">
                Acknowledgement{" "}
                <span className="font-semibold text-slate-800">
                  {filingOutcome.acknowledgementNumber || "—"}
                </span>
                . Most refunds land in 2–5 weeks — track status on the ITD portal.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
            <p className="text-sm font-semibold text-slate-800">Share the calm</p>
            <p className="mt-1 text-xs text-slate-600">{REFERRAL_REFERRER_COPY}</p>
          </div>

          <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={filingOutcome.reminderOptIn}
              onChange={(e) =>
                setFilingOutcome({ reminderOptIn: e.target.checked })
              }
              className="mt-0.5"
            />
            Remind me next assessment year (email / WhatsApp when we open).
          </label>

          <Button href="/learn" variant="outline">
            Read tax guides
          </Button>
          <p className="text-[11px] text-slate-500">{SITE_DISCLAIMER}</p>
        </div>
      </FilingLayout>
    );
  }

  if (status === "lapsed") {
    return (
      <FilingLayout mirrorText="Your return may be treated as never filed if e-verify is missed — it takes about 2 minutes.">
        <div className="mx-auto max-w-lg space-y-5 rounded-3xl border border-amber-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-amber-100 p-2">
              <AlertTriangle className="size-6 text-amber-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                E-verify is overdue
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Acknowledgement {filingOutcome.acknowledgementNumber || "—"}. Verify
                now on the portal with Aadhaar OTP or EVC — calm, not panic.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="https://www.incometax.gov.in/iec/foportal/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white"
            >
              Verify on ITD portal
            </a>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => markReturnEVerified()}
            >
              I already e-verified
            </Button>
          </div>
          <Button href="/file/checkout/everify" variant="ghost">
            E-verify checklist
          </Button>
        </div>
      </FilingLayout>
    );
  }

  // FILED — countdown
  return (
    <FilingLayout mirrorText="You have 30 days from submission to e-verify. Aadhaar OTP is usually the fastest.">
      <div className="mx-auto max-w-lg space-y-5 rounded-3xl border border-blue-100 bg-white p-6 shadow-sm md:p-8">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-blue-100 p-2">
            <Clock className="size-6 text-blue-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Submitted</h1>
            <p className="mt-1 text-sm text-slate-600">
              Acknowledgement{" "}
              <span className="font-semibold">
                {filingOutcome.acknowledgementNumber || ackDraft || "—"}
              </span>
              . E-verify within{" "}
              <span className="font-semibold text-blue-800">{daysLeft} days</span>.
            </p>
          </div>
        </div>

        {!filingOutcome.acknowledgementNumber && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">
              Acknowledgement number
            </label>
            <Input
              value={ackDraft}
              onChange={(e) => setAckDraft(e.target.value)}
              placeholder="e.g. 123456789012345"
            />
            <Button
              disabled={!ackDraft.trim()}
              onClick={() =>
                setFilingOutcome({
                  acknowledgementNumber: ackDraft.trim(),
                  status: "filed",
                  submittedAt: filingOutcome.submittedAt ?? Date.now(),
                })
              }
            >
              Save acknowledgement
            </Button>
          </div>
        )}

        <ul className="space-y-2 text-sm text-slate-700">
          <li>• Aadhaar OTP — fastest for most people</li>
          <li>• Net banking EVC — if Aadhaar is not linked</li>
          <li>• Demat EVC — if you have a demat account</li>
        </ul>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button href="/file/checkout/everify" className="flex-1">
            E-verify steps
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => markReturnEVerified()}
          >
            I already e-verified
          </Button>
        </div>

        <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={filingOutcome.reminderOptIn}
            onChange={(e) =>
              setFilingOutcome({ reminderOptIn: e.target.checked })
            }
            className="mt-0.5"
          />
          Remind me before the 30-day window ends.
        </label>

        <p className="text-[11px] text-slate-500">{SITE_DISCLAIMER}</p>
      </div>
    </FilingLayout>
  );
}

export default function DonePage() {
  return (
    <Suspense fallback={<div className="p-12 text-slate-600">Loading…</div>}>
      <DoneContent />
    </Suspense>
  );
}
