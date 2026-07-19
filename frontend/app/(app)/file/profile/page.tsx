"use client";

import { useProfileStore, profileInitials } from "@/lib/store/profile";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, MoreVertical, LogOut, ArrowLeft, User } from "lucide-react";
import Link from "next/link";
import { ReferralSectionClient } from "./ReferralSectionClient";
import { DeleteAccountClient } from "./DeleteAccountClient";

export default function ProfilePage() {
  const name = useProfileStore((s) => s.name) || "New User";
  const email = useProfileStore((s) => s.email);
  const panLast4 = useProfileStore((s) => s.panLast4) || "Not Available";
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
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/file/dashboard" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">My Tax Returns</h1>
        </div>
        <Link 
          href="/file/import/documents"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-md transition-colors"
        >
          Start a new Filing
        </Link>
      </div>

      <div className="space-y-6">
        {/* Main Profile Info */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* User Info Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold text-lg">
                  {profileInitials(name)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[17px] font-semibold text-slate-900">{name}</h2>
                    <span className="bg-blue-50 text-blue-600 text-xs font-medium px-2 py-0.5 rounded border border-blue-100">
                      Individual
                    </span>
                  </div>
                  <p className="text-[13px] text-slate-500 mt-0.5">
                    PAN: {panLast4 !== "Not Available" ? `XXXXXXX${panLast4}` : "Not Available"}
                  </p>
                </div>
              </div>
              <ChevronDown className="w-5 h-5 text-slate-400" />
            </div>

            {/* Tax Filing History */}
            <div className="p-5 border-t border-slate-100">
              <div className="text-center py-6">
                <p className="text-slate-500 font-medium">No previous filings found.</p>
                <p className="text-sm text-slate-400 mt-1">Your past ITR filings will appear here.</p>
              </div>
            </div>
          </div>

          {/* Invoice History */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Invoice History</h2>
            </div>
            <div className="p-5">
              <div className="text-center py-6">
                <p className="text-slate-500 font-medium">No invoices found.</p>
                <p className="text-sm text-slate-400 mt-1">Your past payments and invoices will appear here.</p>
              </div>
            </div>
          </div>

          {/* Referrals & Wallet */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Referrals & Wallet</h2>
            </div>
            <ReferralSectionClient />
          </div>

          {/* Account Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Account Settings</h2>
            </div>
            <div className="p-5">
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
