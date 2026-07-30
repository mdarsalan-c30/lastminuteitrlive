"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CustomerActions({
  userId,
  status,
  flagged,
}: {
  userId: string;
  status: string;
  flagged: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function update(action: string, reason?: string) {
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        window.alert(body.error || "Could not update customer");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        type="button"
        disabled={busy}
        onClick={() => void update(status === "blocked" ? "unblock" : "block")}
        className="rounded-md border border-border px-2 py-1 text-xs font-medium hover:bg-muted disabled:opacity-50"
      >
        {status === "blocked" ? "Unblock" : "Block"}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          if (flagged) {
            void update("unflag");
            return;
          }
          const reason = window.prompt("Reason for flagging this customer:");
          if (reason?.trim()) void update("flag", reason.trim());
        }}
        className="rounded-md border border-border px-2 py-1 text-xs font-medium hover:bg-muted disabled:opacity-50"
      >
        {flagged ? "Remove flag" : "Flag"}
      </button>
    </div>
  );
}
