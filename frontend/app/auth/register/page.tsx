"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useProfileStore } from "@/lib/store/profile";
import { User, Mail, Lock, Tag, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialName = searchParams.get("name") || "";

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

      // Redirect to getting started
      router.push("/file/onboarding/eligibility?step=about-you");
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#f4f7f6] px-4 py-12 overflow-hidden font-sans">
      {/* Background Ambient Glow */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[#0e5f63]/10 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />

      {/* Main Register Card */}
      <div className="relative w-full max-w-[440px] rounded-[28px] bg-white p-8 sm:p-10 shadow-[0_20px_60px_-15px_rgba(14,95,99,0.14)] border border-slate-200/80">
        
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
            href={initialName ? `/auth/login?name=${encodeURIComponent(initialName)}` : "/auth/login"}
            className="font-bold text-[#0e5f63] hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
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