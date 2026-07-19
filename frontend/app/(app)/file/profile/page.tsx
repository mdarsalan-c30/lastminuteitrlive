"use client";

import { useProfileStore } from "@/lib/store/profile";
import { useRouter } from "next/navigation";
import { ChevronDown, MoreVertical, LogOut, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { profileInitials } from "@/lib/store/profile";

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* User Card & Filings */}
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

            {/* Tax Filing History Details */}
            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">AY 2026-2027</h3>
                <p className="text-[13px] text-slate-500 mt-0.5">(Current year)</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-[13px]">
                  <span className="flex size-4 items-center justify-center rounded-full bg-orange-100 text-orange-600 font-bold text-[10px]">!</span>
                  <span className="font-semibold text-slate-700">E-Filed</span>
                  <span className="text-orange-600 font-medium">Pending</span>
                </div>
                <div className="flex items-center gap-2 text-[13px]">
                  <span className="flex size-4 items-center justify-center rounded-full bg-orange-100 text-orange-600 font-bold text-[10px]">!</span>
                  <span className="font-semibold text-slate-700">E-Verification</span>
                  <span className="text-orange-600 font-medium">Pending</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link 
                  href="/file/dashboard"
                  className="text-blue-600 border border-blue-600 hover:bg-blue-50 font-medium text-sm py-2 px-4 rounded-md transition-colors"
                >
                  Continue Filing
                </Link>
                <button className="text-slate-400 hover:text-slate-600 p-1">
                  <MoreVertical className="w-5 h-5" />
                </button>
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

        {/* Right Column (Sidebar) */}
        <div className="lg:col-span-1">
          <div className="bg-[#F8FAFC] rounded-xl border border-slate-200 overflow-hidden sticky top-24 shadow-sm">
            <div className="h-40 bg-blue-50 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAFC] to-transparent z-10" />
              {/* Decorative elements representing the image */}
              <div className="absolute inset-0 flex items-center justify-center opacity-80">
                <div className="w-24 h-24 bg-white rounded-full border-4 border-blue-100 flex items-center justify-center shadow-lg -translate-x-6 z-20">
                  <User className="w-10 h-10 text-slate-400" />
                </div>
                <div className="w-20 h-20 bg-white rounded-full border-4 border-slate-100 flex items-center justify-center shadow-md translate-x-6 -translate-y-4">
                  <User className="w-8 h-8 text-blue-300" />
                </div>
              </div>
            </div>
            <div className="p-6 relative z-20 -mt-8">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Need an expert to file?</h3>
              <p className="text-[14px] text-slate-600 mb-5">
                Let an expert handle it - you relax. Our CAs will ensure maximum refund and zero notices.
              </p>
              <button className="w-full py-2.5 px-4 bg-white border border-blue-600 text-blue-600 font-medium rounded-md hover:bg-blue-50 transition-colors">
                Book Now
              </button>
            </div>
          </div>
        </div>

      </div>
      
      {/* Footer text (mimicking the reference) */}
      <div className="mt-16 pt-8 border-t border-slate-200 text-[11px] text-slate-400 flex flex-col md:flex-row justify-between gap-8">
        <div className="max-w-2xl leading-relaxed">
          LastminuteITR is a technology platform to simplify tax filing. Any transaction in respect of ERI Services is strictly a bilateral transaction between the technology facilitator and the user.
          <div className="mt-3 flex gap-4">
            <Link href="#" className="hover:text-slate-600 underline">Terms of Use</Link>
            <Link href="#" className="hover:text-slate-600 underline">Privacy</Link>
          </div>
        </div>
        <div className="flex items-center gap-6 shrink-0 text-slate-500">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded bg-slate-100 flex items-center justify-center font-bold text-[10px]">ISO</div>
            <span>ISO 27001<br/>Data Center</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded bg-slate-100 flex items-center justify-center font-bold text-[10px]">SSL</div>
            <span>SSL Certified Site<br/>128-bit encryption</span>
          </div>
        </div>
      </div>

    </div>
  );
}
