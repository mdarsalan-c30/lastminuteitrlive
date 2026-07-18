"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDraftStore } from "@/lib/store/draft";
import { getPlan } from "@/lib/payments/plans";
import { getEffectivePrice, getDisplayPricing, formatPlanPriceLabel } from "@/lib/marketing/pricing";
import { FilingLayout } from "@/components/filing/FilingLayout";
import RazorpayButton from "@/components/filing/checkout/RazorpayButton";
import { usePaymentSession } from "@/lib/hooks/usePaymentSession";
import { CHECKOUT_PAYMENT, FILING_COMPANION } from "@/lib/copy/filing";
import { PAYMENT_COPY } from "@/lib/copy/marketing";
import { getBrowserSessionId } from "@/lib/store/sessionInit";
import {
  getActiveProfileId,
  restoreWorkspace,
  saveDraftToProfile,
  setActiveProfileId,
  useFilingCredit,
} from "@/lib/family/client";
import {
  Card,
  FilingActions,
  ScreenTitle,
  Button,
} from "@/components/filing/ui";
import { triggerConfetti } from "@/components/filing/Confetti";
import { ShieldCheck, Tag, Sparkles } from "lucide-react";

export default function PaymentPage() {
  const router = useRouter();
  const { plan, setPaymentVerified } = useDraftStore();
  const { refresh: refreshPaymentSession } = usePaymentSession();
  
  const selectedPlan = getPlan(plan);
  const basePrice = getEffectivePrice(plan);
  const displayPricing = getDisplayPricing(plan);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const [couponCode, setCouponCode] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const [validatedDiscount, setValidatedDiscount] = useState<{
    code: string;
    discountType: "percentage" | "fixed" | "full" | "amount";
    percentageOff?: number;
    amountOff?: number;
  } | null>(null);

  const [filingForName, setFilingForName] = useState<string | null>(null);
  const [activeProfileId, setActiveProfileIdState] = useState<string | null>(null);
  const [filingsRemaining, setFilingsRemaining] = useState(0);
  const [usingCredit, setUsingCredit] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const ws = await restoreWorkspace();
        setFilingsRemaining(ws.filingsRemaining);
        const pid = getActiveProfileId() ?? ws.activeProfileId;
        setActiveProfileIdState(pid);
        if (pid) setActiveProfileId(pid);
        const person = ws.profiles.find((p) => p.id === pid);
        setFilingForName(person?.name ?? null);
      } catch {
        setFilingForName(null);
      }
    })();
  }, []);

  const finishPayment = async () => {
    const profileId = activeProfileId ?? getActiveProfileId();
    if (!profileId) {
      setPaymentError("Pick who you are filing for first (People I file for).");
      return;
    }
    setPaymentVerified(plan);
    await refreshPaymentSession();
    // Best-effort save; never block the unlock redirect on it (can be slow).
    void saveDraftToProfile(profileId).catch(() => {});
    router.push("/file/companion?unlocked=1");
  };

  const handleUseCredit = async () => {
    const profileId = activeProfileId ?? getActiveProfileId();
    if (!profileId) {
      setPaymentError("Pick who you are filing for first (People I file for).");
      return;
    }
    setUsingCredit(true);
    setPaymentError(null);
    try {
      await useFilingCredit(profileId, plan);
      await finishPayment();
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Could not use credit");
    } finally {
      setUsingCredit(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    setCouponError(null);
    setCouponSuccess(null);
    setValidatedDiscount(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), planId: plan }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        throw new Error(data.reason ?? "Invalid code");
      }
      
      setValidatedDiscount({
        code: couponCode.trim(),
        discountType: data.discount, // Will be "full" | "amount" | "percentage"
        percentageOff: data.percentageOff,
        amountOff: data.amountOff,
      });
      setCouponSuccess("Code applied successfully!");
      triggerConfetti();
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const calculateFinalPrice = () => {
    if (!validatedDiscount) return basePrice;
    // Handle full discount (coupons that cover entire price)
    if (validatedDiscount.discountType === "full") {
      return 0;
    }

    // Handle amount discount (amount-off coupons)
    if (validatedDiscount.discountType === "amount" && validatedDiscount.amountOff) {
      return Math.max(0, basePrice - validatedDiscount.amountOff);
    }

    // Handle percentage discount (referrals or percentage coupons)
    if (validatedDiscount.discountType === "percentage" && validatedDiscount.percentageOff) {
      return Math.max(0, basePrice - (basePrice * validatedDiscount.percentageOff) / 100);
    }

    // Fallback for previous misnamed types if any
    if (validatedDiscount.discountType === "fixed" && validatedDiscount.amountOff) {
      return Math.max(0, basePrice - validatedDiscount.amountOff);
    }

    return basePrice;
  };

  const finalPrice = calculateFinalPrice();
  const isFree = finalPrice === 0;

  const handleFreeCheckout = async () => {
    setPaymentError(null);
    const profileId = activeProfileId ?? getActiveProfileId();
    if (!profileId) {
      setPaymentError("Pick who you are filing for first (People I file for).");
      return;
    }
    try {
      const res = await fetch("/api/coupons/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: validatedDiscount?.code, planId: plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      
      setPaymentVerified(plan);
      await refreshPaymentSession();
      await saveDraftToProfile(profileId).catch(() => {});
      router.push("/file/companion?unlocked=1");
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Checkout failed");
    }
  };

  return (
    <FilingLayout mirrorText="You're paying for the step-by-step portal guide — not government filing.">
      <div className="max-w-2xl mx-auto space-y-5 pb-32">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">{CHECKOUT_PAYMENT.title}</h1>
          <p className="text-sm text-slate-600 mt-2">{CHECKOUT_PAYMENT.subtitle}</p>
          {filingForName && (
            <p className="mt-2 text-sm text-slate-700">
              Unlocking for: <strong className="text-slate-900">{filingForName}</strong>
              {filingsRemaining > 0 && (
                <span className="text-slate-600 block text-xs mt-1">
                  {filingsRemaining} filing credit{filingsRemaining === 1 ? "" : "s"} available
                </span>
              )}
            </p>
          )}
        </div>

        {/* Main Payment Card */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">

          {/* Amount Section */}
          <div className="mb-6 pb-6 border-b border-slate-200">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Amount Due</p>
            <div className="flex items-baseline justify-between">
              <div className={validatedDiscount || isFree ? "" : "blur-sm opacity-40 flex-1"}>
                {validatedDiscount ? (
                  <div className="space-y-1">
                    <p className="text-sm text-slate-500 line-through">
                      {formatPlanPriceLabel(basePrice)}
                    </p>
                    <p className="text-4xl font-black text-emerald-600">
                      {finalPrice === 0 ? "FREE" : formatPlanPriceLabel(finalPrice)}
                    </p>
                  </div>
                ) : isFree ? (
                  <p className="text-4xl font-black text-emerald-600">FREE</p>
                ) : (
                  <p className="text-4xl font-black text-slate-900">
                    {formatPlanPriceLabel(basePrice)}
                  </p>
                )}
              </div>
              {!validatedDiscount && !isFree && (
                <p className="text-xs text-slate-500 text-right">Apply coupon to unlock discount</p>
              )}
            </div>
          </div>

          {/* Coupon Code Section */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Have a coupon code?</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="flex-1 min-h-10 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 uppercase font-mono bg-white text-slate-900 transition-all"
                disabled={applyingCoupon || !!validatedDiscount}
              />
              {validatedDiscount ? (
                <Button
                  variant="secondary"
                  className="min-h-10 px-4 rounded-lg text-sm font-medium"
                  onClick={() => {
                    setValidatedDiscount(null);
                    setCouponCode("");
                    setCouponSuccess(null);
                  }}
                >
                  Remove
                </Button>
              ) : (
                <Button
                  variant="primary"
                  className="min-h-10 px-6 rounded-lg text-sm font-medium"
                  onClick={handleApplyCoupon}
                  disabled={applyingCoupon || !couponCode.trim()}
                >
                  {applyingCoupon ? "Applying..." : "Apply"}
                </Button>
              )}
            </div>
            {couponError && <p className="text-xs text-red-600 mt-2">{couponError}</p>}
            {couponSuccess && (
              <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> {couponSuccess}
              </p>
            )}
          </div>

        </div>

        {/* Error Message */}
        {paymentError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {paymentError}
          </div>
        )}

        {/* Payment Buttons - PROMINENT */}
        <div className="space-y-3">
          {filingsRemaining > 0 && !isFree && (
            <Button
              variant="secondary"
              className="w-full min-h-14 rounded-xl text-base font-semibold"
              onClick={handleUseCredit}
              disabled={usingCredit}
            >
              {usingCredit ? "Applying credit…" : `Use Filing Credit (${filingsRemaining} left)`}
            </Button>
          )}

          {isFree ? (
            <Button
              variant="primary"
              className="w-full min-h-14 rounded-xl text-base font-semibold shadow-lg"
              onClick={handleFreeCheckout}
            >
              Unlock Guide Now
            </Button>
          ) : (
            <RazorpayButton
              planId={plan}
              couponCode={validatedDiscount?.code}
              familyProfileId={activeProfileId}
              onSuccess={finishPayment}
              onError={setPaymentError}
              className="w-full min-h-14 rounded-xl text-lg font-bold shadow-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all transform hover:scale-[1.02]"
            />
          )}
        </div>

        {/* Dev Mode Notice */}
        {!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && !isFree && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm">
            <p className="font-semibold mb-2">Payment gateway setup in progress</p>
            <p className="mb-3">For testing, you can continue with a development unlock.</p>
            <Button
              variant="secondary"
              className="w-full"
              onClick={async () => {
                setPaymentError(null);
                const profileId = activeProfileId ?? getActiveProfileId();
                if (!profileId) {
                  setPaymentError("Pick who you are filing for first.");
                  return;
                }
                try {
                  const res = await fetch("/api/payments/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "same-origin",
                    body: JSON.stringify({
                      razorpay_order_id: `order_mock_${Date.now()}`,
                      razorpay_payment_id: `pay_mock_${Date.now()}`,
                      razorpay_signature: "mock_signature",
                      planId: plan,
                      mock: true,
                      sessionId: getBrowserSessionId(),
                      familyProfileId: profileId ?? undefined,
                    }),
                  });
                  const data = await res.json();
                  if (!res.ok || !data.verified) {
                    throw new Error(data.error ?? "Dev unlock failed");
                  }
                  await finishPayment();
                } catch (err) {
                  setPaymentError(
                    err instanceof Error ? err.message : "Dev unlock failed"
                  );
                }
              }}
            >
              Continue with Dev Unlock
            </Button>
          </div>
        )}

        {/* Security & Info */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-slate-600 text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>{PAYMENT_COPY.secureLine} via Razorpay</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
            By paying, you unlock the portal filing guide. You manually submit your return on incometax.gov.in.{" "}
            <Link href="/terms" className="text-slate-700 underline">
              Terms
            </Link>
            {" · "}
            <Link href="/refund-policy" className="text-slate-700 underline">
              Refunds
            </Link>
          </p>
        </div>

      </div>
    </FilingLayout>
  );
}
