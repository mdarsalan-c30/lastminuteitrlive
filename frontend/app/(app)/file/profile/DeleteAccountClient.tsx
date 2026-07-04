"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProfileStore } from "@/lib/store/profile";

export function DeleteAccountClient({ verifiedEmail }: { verifiedEmail: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState<"data" | "account" | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const clearProfile = useProfileStore((s) => s.clearProfile);

  const isMatch = emailInput.trim().toLowerCase() === verifiedEmail.toLowerCase();

  const handleOpen = (mode: "data" | "account") => {
    setDeleteMode(mode);
    setIsOpen(true);
    setEmailInput("");
    setIsChecked(false);
    setError("");
  };

  async function handleDelete() {
    if (!isMatch || !isChecked || !deleteMode) return;
    setLoading(true);
    setError("");
    try {
      const endpoint = deleteMode === "data" ? "/api/user/erasure/data" : "/api/user/erasure";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.deleted) {
        // DPDP Client-side Cleanup
        localStorage.removeItem("lastminute-itr-draft");
        localStorage.removeItem("lastminute-itr-profile");
        sessionStorage.clear();
        clearProfile();

        setIsOpen(false);
        if (deleteMode === "account") {
          router.push("/?deleted=true");
        } else {
          router.push("/auth/login?data_deleted=true");
        }
      } else {
        setError(data.error || `Failed to delete ${deleteMode}`);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => handleOpen("data")}
          className="rounded-md border border-orange-200 px-4 py-2 text-sm font-medium text-orange-700 transition-colors hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        >
          Delete All My Data
        </button>
        <button
          onClick={() => handleOpen("account")}
          className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Delete My Account
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm sm:p-0">
          <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5">
            <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {deleteMode === "data" ? "Delete All My Data" : "Delete Account and Data"}
              </h3>
            </div>

            <div className="p-6">
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="font-semibold text-red-800">
                  Warning: This action is permanent and cannot be undone.
                </p>
                <p className="mt-2 text-sm text-red-700">
                  {deleteMode === "data"
                    ? "We will immediately purge your files and draft data from our servers. You will still be able to log in to start fresh."
                    : "By deleting your account, you are withdrawing your consent to process your tax data. We will permanently close your account and purge all files."}
                </p>
              </div>

              <div className="space-y-4 text-sm text-gray-700">
                <div>
                  <span className="font-semibold text-gray-900">
                    What will be permanently deleted:
                  </span>
                  <ul className="mt-1 list-inside space-y-1">
                    {deleteMode === "account" && <li>❌ Your account login credentials</li>}
                    <li>❌ All uploaded tax PDFs (Form 16, AIS, etc.)</li>
                    <li>❌ Your ITR filing draft calculations and questionnaire history</li>
                    <li>❌ Your chat support history and assistant logs</li>
                    <li>❌ Your browser-persisted profile data and active sessions</li>
                  </ul>
                </div>

                <div>
                  <span className="font-semibold text-gray-900">
                    What we are legally required to retain:
                  </span>
                  <ul className="mt-1 list-inside space-y-1">
                    <li>
                      📋 Tax invoices and payment metadata (Razorpay Order/Payment IDs)
                      are retained for 8 years solely to comply with the Indian CGST Act 2017
                      and financial audit laws. This data will never be used for tax prep or marketing.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex items-start space-x-3">
                <div className="flex h-5 items-center">
                  <input
                    id="confirm-checkbox"
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => setIsChecked(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                </div>
                <div className="text-sm">
                  <label htmlFor="confirm-checkbox" className="font-medium text-gray-700 cursor-pointer">
                    I understand that this action is permanent and I will immediately lose access to my tax drafts, chats, and uploaded files.
                  </label>
                </div>
              </div>

              <div className="mt-5">
                <label className="block text-sm font-medium text-gray-700">
                  To confirm deletion, please type your registered email (<code>{verifiedEmail}</code>) below:
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                  placeholder="name@example.com"
                />
              </div>

              {error && (
                <p className="mt-2 text-sm font-medium text-red-600">{error}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
              <button
                onClick={() => setIsOpen(false)}
                disabled={loading}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={!isMatch || !isChecked || loading}
                className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? "Processing..." : deleteMode === "data" ? "Delete My Data" : "Permanently Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

