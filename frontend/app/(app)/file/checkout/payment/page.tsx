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
    discountType: "full" | "amount" | "percentage";
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

    // Handle percentage discount (referrals or percentage coupons)
    if (validatedDiscount.discountType === "percentage" && validatedDiscount.percentageOff) {
      return Math.max(0, basePrice - (basePrice * validatedDiscount.percentageOff) / 100);
    }

    // Handle amount discount (amount-off coupons)
    if (validatedDiscount.discountType === "amount" && validatedDiscount.amountOff) {
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
      <div className="max-w-2xl mx-auto space-y-6 pb-24">
        
        <div className="text-center mb-8">
          <ScreenTitle
            title={CHECKOUT_PAYMENT.title}
            subtitle={CHECKOUT_PAYMENT.subtitle}
          />
          {filingForName && (
            <p className="mt-3 text-sm text-slate-600">
              Unlocking guide for <strong>{filingForName}</strong>
              {filingsRemaining > 0 && (
                <span className="text-slate-500">
                  {" "}
                  · {filingsRemaining} filing credit{filingsRemaining === 1 ? "" : "s"} in wallet
                </span>
              )}
            </p>
          )}
          {!filingForName && (
            <p className="mt-3 text-sm text-amber-700">
              <Link href="/file/family" className="font-semibold underline underline-offset-2">
                Pick who you are filing for
              </Link>{" "}
              before payment — each person needs their own unlock.
            </p>
          )}
        </div>

        {/* Premium Plan Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white shadow-xl">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Sparkles className="w-24 h-24" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-md mb-3">
                Selected Plan
              </span>
              <h2 className="text-3xl font-bold">{selectedPlan.name}</h2>
              <p className="text-slate-300 mt-2 max-w-sm text-sm leading-relaxed">
                Unlock full access to the portal filing guide tailored for your income sources.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 min-w-[160px] text-right border border-white/10 shadow-inner">
              <p className="text-xs text-slate-300 uppercase tracking-wider font-semibold mb-1">Total</p>
              
              {validatedDiscount ? (
                <>
                  <div className="text-sm text-slate-400 line-through mb-1">
                    {formatPlanPriceLabel(basePrice)}
                  </div>
                  <div className="text-4xl font-black text-green-400">
                    {finalPrice === 0 ? "FREE" : formatPlanPriceLabel(finalPrice)}
                  </div>
                </>
              ) : (
                <div className="text-4xl font-black text-white">
                  {formatPlanPriceLabel(basePrice)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Coupon Code Section */}
        <Card className="border-0 shadow-sm bg-white rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Coupon Code</h3>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Enter code here"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className="flex-1 min-h-12 px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary uppercase font-mono bg-slate-50 text-slate-900 transition-all"
              disabled={applyingCoupon || !!validatedDiscount}
            />
            {validatedDiscount ? (
              <Button
                variant="secondary"
                className="min-h-12 px-6 rounded-xl text-sm font-medium"
                onClick={() => {
                  setValidatedDiscount(null);
                  setCouponCode("");
                  setCouponSuccess(null);
                }}
              >
                Remove Code
              </Button>
            ) : (
              <Button
                variant="primary"
                className="min-h-12 px-8 rounded-xl text-sm font-medium shadow-md hover:shadow-lg transition-all"
                onClick={handleApplyCoupon}
                disabled={applyingCoupon || !couponCode.trim()}
              >
                {applyingCoupon ? "Applying..." : "Apply Code"}
              </Button>
            )}
          </div>
          
          {couponError && (
            <div className="mt-3 text-sm text-red-500 flex items-center gap-1.5 bg-red-50 p-3 rounded-lg border border-red-100">
              {couponError}
            </div>
          )}
          
          {couponSuccess && (
            <div className="mt-3 text-sm text-emerald-600 flex items-center gap-1.5 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
              <ShieldCheck className="w-4 h-4" />
              {couponSuccess}
            </div>
          )}
        </Card>

        {paymentError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {paymentError}
          </div>
        )}

        {/* PAYMENT_API_TODO — Razorpay create/verify when production keys are live. */}
        {!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && !isFree && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm space-y-2">
            <p className="font-semibold">Payment gateway wiring in progress</p>
            <p>
              Razorpay will be connected here later. For now you can continue with a
              development unlock so filing assistance stays testable.
            </p>
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={async () => {
                setPaymentError(null);
                const profileId = activeProfileId ?? getActiveProfileId();
                if (!profileId) {
                  setPaymentError("Pick who you are filing for first (People I file for).");
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
              Continue without live payment (dev)
            </Button>
          </div>
        )}

        <FilingActions
          hint={
            <div className="flex items-center justify-center gap-2 text-slate-500 text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>{PAYMENT_COPY.secureLine} · Payments processed securely</span>
            </div>
          }
        >
          {filingsRemaining > 0 && !isFree && (
            <Button
              variant="secondary"
              className="min-h-12 w-full md:w-auto rounded-xl text-base"
              onClick={handleUseCredit}
              disabled={usingCredit}
            >
              {usingCredit ? "Applying credit…" : `Use 1 filing credit (${filingsRemaining} left)`}
            </Button>
          )}
          {isFree ? (
            <Button
              variant="primary"
              className="min-h-12 w-full md:w-auto rounded-xl text-base shadow-lg"
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
              className="min-h-12 w-full md:w-auto rounded-xl text-base shadow-lg"
            />
          )}
        </FilingActions>
        
        <p className="text-center text-xs text-slate-400 mt-6 max-w-md mx-auto leading-relaxed">
          By proceeding, you agree to our <Link href="/terms" className="underline hover:text-slate-600 transition-colors">Terms</Link> and <Link href="/refund-policy" className="underline hover:text-slate-600 transition-colors">Refund Policy</Link>. This unlocks the portal guide—you must manually submit your return on incometax.gov.in.
        </p>

      </div>
    </FilingLayout>
  );
}
