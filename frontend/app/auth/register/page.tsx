"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useProfileStore } from "@/lib/store/profile";
import { User, Mail, Lock, Tag, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
function RegisterForm() {
  const searchParams = useSearchParams();
  const initialName = searchParams.get("name") || "";
  const requestedNext = searchParams.get("next");
  const nextPath =
    requestedNext?.startsWith("/") && !requestedNext.startsWith("//")
      ? requestedNext
      : "/file/onboarding/eligibility?step=about-you";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/auth/b2c/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const d = await res.json();

      if (!res.ok) {
        throw new Error(d.error || "Failed to register");
      }

      // Sync the profile store so headers/navbar update immediately
      if (d.user) {
        useProfileStore.getState().setProfile({
          name: d.user.name,
          email: d.user.email,
        });
      }

      window.location.assign(nextPath);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#eef4f3] font-sans lg:grid lg:grid-cols-[minmax(0,1.12fr)_minmax(440px,0.88fr)]">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#0e5f63] lg:flex lg:items-end">
        <div
          className="absolute inset-[-18px] scale-105 bg-cover bg-center opacity-45 blur-[3px]"
          style={{
            backgroundImage: "url('/registration-workspace-preview.png')",
          }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#073f42]/90 via-[#0e5f63]/72 to-[#0e5f63]/92" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_15%,rgba(255,255,255,0.2),transparent_36%)]" />

        <div className="relative z-10 w-full p-10 xl:p-14">
          <div className="max-w-xl rounded-[28px] border border-white/20 bg-[#073f42]/55 p-7 text-white shadow-2xl backdrop-blur-md">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white">
                <BrandLogo size="xs" variant="icon" />
              </span>
              <div>
                <p className="text-lg font-bold">Your filing stays with you</p>
                <p className="text-sm text-white/70">
                  Continue exactly where you stopped.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Progress saved", "Your entered details stay in this browser."],
                ["No payment now", "Review the journey before choosing a plan."],
                ["You stay in control", "Nothing is filed automatically."],
              ].map(([title, body]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/15 bg-white/10 p-4"
                >
                  <ShieldCheck className="mb-2 h-4 w-4 text-emerald-200" />
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/65">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 sm:px-8 lg:py-12">
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#0e5f63]/12 to-transparent lg:hidden" />
        <div className="absolute -right-24 top-12 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />

        {/* Main Register Card */}
        <div className="relative w-full max-w-[460px] rounded-[28px] border border-white/90 bg-white/95 p-7 shadow-[0_24px_70px_-28px_rgba(14,95,99,0.35)] backdrop-blur sm:p-9">
        
        {/* Brand Header & Custom Logo */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <BrandLogo size="xs" variant="icon" />
            <span className="text-lg font-bold tracking-tight text-slate-950">
              LastminuteITR
            </span>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            {initialName ? `Continue, ${initialName}` : "Create an account"}
          </h1>
          <p className="mt-2 text-[14px] text-slate-500">
            Let&apos;s get started with your tax filing journey
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="mb-1.5 block text-[13px] font-semibold text-slate-700">
              Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                <User className="h-4 w-4" />
              </div>
              <input
                key={`name-input-${initialName}`}
                id="name"
                name="name"
                type="text"
                required
                defaultValue={initialName}
                placeholder="e.g. Rahul"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-[14px] text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-[#0e5f63] focus:bg-white focus:ring-4 focus:ring-[#0e5f63]/10"
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="mb-1.5 block text-[13px] font-semibold text-slate-700">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-[14px] text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-[#0e5f63] focus:bg-white focus:ring-4 focus:ring-[#0e5f63]/10"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="mb-1.5 block text-[13px] font-semibold text-slate-700">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Create a password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-[14px] text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-[#0e5f63] focus:bg-white focus:ring-4 focus:ring-[#0e5f63]/10"
              />
            </div>
          </div>

          {/* Referral Code (Optional) */}
          <div>
            <label htmlFor="referralCode" className="mb-1.5 block text-[13px] font-semibold text-slate-700">
              Referral Code <span className="font-normal text-slate-400">(Optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                <Tag className="h-4 w-4" />
              </div>
              <input
                id="referralCode"
                name="referralCode"
                type="text"
                placeholder="Enter referral code"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-[14px] text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-[#0e5f63] focus:bg-white focus:ring-4 focus:ring-[#0e5f63]/10 uppercase font-mono tracking-wider"
              />
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-[13px] font-medium text-red-600 border border-red-100 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Green Continue Button */}
          <button
            type="submit"
            disabled={loading}
            className={cn(
              "group relative flex w-full items-center justify-center gap-2 rounded-xl bg-[#0e5f63] px-5 py-3.5 text-[15px] font-semibold text-white shadow-md shadow-[#0e5f63]/25 transition-all hover:bg-[#0b4b4e] active:scale-[0.99] mt-2",
              loading && "opacity-75 cursor-not-allowed"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>

          <Link
            href="/file/start"
            className="flex min-h-11 items-center justify-center rounded-xl text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-[#0e5f63]"
          >
            Skip for now
          </Link>
          <p className="-mt-2 text-center text-xs leading-relaxed text-slate-400">
            Continue your draft without an account. Registration is required
            only before payment.
          </p>
        </form>

        {/* Security Badge */}
        <div className="mt-5 flex items-center justify-center gap-1.5 text-[12px] font-medium text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-[#0e5f63]" />
          <span>256-Bit SSL Encrypted & Tax Department Compliant</span>
        </div>

        {/* Footer Link */}
        <p className="mt-5 text-center text-sm text-slate-500 border-t border-slate-100 pt-5">
          Already have an account?{" "}
          <Link
            href={`/auth/login?${new URLSearchParams({
              ...(initialName ? { name: initialName } : {}),
              ...(requestedNext ? { next: nextPath } : {}),
            }).toString()}`}
            className="font-bold text-[#0e5f63] hover:underline"
          >
            Log in
          </Link>
        </p>
        </div>
      </section>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f4f7f6]" />}>
      <RegisterForm />
    </Suspense>
  );
}
