"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useProfileStore } from "@/lib/store/profile";
import { Mail, Lock, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
function LoginForm() {
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
      const res = await fetch("/api/auth/b2c/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const d = await res.json();

      if (!res.ok) {
        throw new Error(d.error || "Failed to log in");
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

      {/* Main Login Card */}
      <div className="relative w-full max-w-[440px] rounded-[28px] bg-white p-8 sm:p-10 shadow-[0_20px_60px_-15px_rgba(14,95,99,0.14)] border border-slate-200/80">
        
        {/* Brand Header & Logo */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <BrandLogo size="xs" variant="icon" />
            <span className="text-lg font-bold tracking-tight text-slate-950">
              LastminuteITR
            </span>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            {initialName ? `Welcome back, ${initialName}` : "Welcome back"}
          </h1>
          <p className="mt-2 text-[14px] text-slate-500">
            Log in to continue your tax filing journey
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email */}
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
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-3 text-[14px] text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-[#0e5f63] focus:bg-white focus:ring-4 focus:ring-[#0e5f63]/10"
              />
            </div>
          </div>

          {/* Password */}
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
                placeholder="Enter your password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-3 text-[14px] text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-[#0e5f63] focus:bg-white focus:ring-4 focus:ring-[#0e5f63]/10"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-xl bg-red-50 p-3.5 text-[13px] font-medium text-red-600 border border-red-100 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Green Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={cn(
              "group relative flex w-full items-center justify-center gap-2 rounded-xl bg-[#0e5f63] px-5 py-3.5 text-[15px] font-semibold text-white shadow-md shadow-[#0e5f63]/25 transition-all hover:bg-[#0b4b4e] active:scale-[0.99]",
              loading && "opacity-75 cursor-not-allowed"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Logging in...</span>
              </>
            ) : (
              <>
                <span>Log In</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>

        {/* Security Badge */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[12px] font-medium text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-[#0e5f63]" />
          <span>256-Bit SSL Encrypted & Tax Department Compliant</span>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-slate-500 border-t border-slate-100 pt-6">
          Don&apos;t have an account?{" "}
          <Link
            href={initialName ? `/auth/register?name=${encodeURIComponent(initialName)}` : "/auth/register"}
            className="font-bold text-[#0e5f63] hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f4f7f6]" />}>
      <LoginForm />
    </Suspense>
  );
}