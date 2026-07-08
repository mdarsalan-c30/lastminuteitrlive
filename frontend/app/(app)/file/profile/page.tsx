"use client";

import { useProfileStore } from "@/lib/store/profile";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { useState } from "react";

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
    <div className="max-w-2xl mx-auto py-12 px-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="flex size-16 items-center justify-center rounded-full bg-blue-100 text-blue-700">
            <User className="size-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{name || "Your Profile"}</h1>
            <p className="text-slate-500">{email || "No email provided"}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border-t border-slate-100 pt-6">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Account Settings</h2>
            
            <button
              onClick={handleLogout}
              disabled={loading}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition-colors p-2 rounded-lg hover:bg-red-50 disabled:opacity-50"
            >
              <LogOut className="size-5" />
              {loading ? "Signing out..." : "Sign Out"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
