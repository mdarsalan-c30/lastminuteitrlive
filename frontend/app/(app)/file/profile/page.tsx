"use client";

import { useProfileStore } from "@/lib/store/profile";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { useState } from "react";
import { ReferralSectionClient } from "./ReferralSectionClient";
import { DeleteAccountClient } from "./DeleteAccountClient";

export default function ProfilePage() {
  const name = useProfileStore((s) => s.name);
  const email = useProfileStore((s) => s.email);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/b2c/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
      <div className="space-y-6">
        {/* Main Profile Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex size-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
              <User className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{name || "Your Profile"}</h1>
              <p className="text-slate-500">{email || "No email provided"}</p>
            </div>
          </div>
        </div>

        {/* Tax Filing History */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Tax Filing History</h2>
          </div>
          <div className="p-6">
            <div className="text-center py-8">
              <p className="text-slate-500 font-medium">No previous filings found.</p>
              <p className="text-sm text-slate-400 mt-1">Your past ITR filings will appear here.</p>
            </div>
          </div>
        </div>

        {/* Referrals & Wallet */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Referrals & Wallet</h2>
          </div>
          <ReferralSectionClient />
        </div>

        {/* Account Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Account Settings</h2>
          </div>
          <div className="p-6">
            <button
              onClick={handleLogout}
              disabled={loading}
              className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-medium transition-colors py-2 px-4 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 mb-6"
            >
              <LogOut className="size-5" />
              {loading ? "Signing out..." : "Sign Out"}
            </button>

            <div className="border-t border-slate-100 pt-6">
              <h3 className="text-sm font-medium text-slate-900 mb-2">Danger Zone</h3>
              <p className="text-xs text-slate-500 max-w-xl">
                Deleting your account or data is permanent. You will lose access to all your drafts, uploaded documents, and history.
              </p>
              {email && <DeleteAccountClient verifiedEmail={email} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
