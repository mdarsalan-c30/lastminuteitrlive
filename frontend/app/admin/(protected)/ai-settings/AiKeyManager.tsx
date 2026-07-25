"use client";

import { useEffect, useState } from "react";

type Status = {
  primaryConfigured: boolean;
  fallbackSlots: Array<{ slot: number; configured: boolean }>;
  updatedAt: string | null;
  updatedBy: string | null;
};

export function AiKeyManager() {
  const [status, setStatus] = useState<Status | null>(null);
  const [keys, setKeys] = useState(["", "", "", ""]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    const response = await fetch("/api/admin/ai-keys", { cache: "no-store" });
    const data = await response.json();
    if (response.ok) setStatus(data);
  }

  useEffect(() => {
    void load();
  }, []);

  async function save() {
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/admin/ai-keys", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keys: keys.filter((key) => key.trim()) }),
    });
    const data = await response.json();
    if (response.ok) {
      setStatus(data);
      setKeys(["", "", "", ""]);
      setMessage("Fallback keys updated. Enter all desired keys whenever you replace the list.");
    } else {
      setMessage(data.error ?? "Unable to update keys.");
    }
    setBusy(false);
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Groq provider</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Primary environment key: {status?.primaryConfigured ? "configured" : "not configured"}
          </p>
        </div>
        <div className="text-xs text-muted-foreground">
          Stored fallback slots: {status?.fallbackSlots.filter((slot) => slot.configured).length ?? 0}/4
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {keys.map((key, index) => {
          const configured = status?.fallbackSlots[index]?.configured;
          return (
            <label key={index} className="text-sm font-medium">
              Fallback key {index + 1}
              <input
                type="password"
                autoComplete="new-password"
                value={key}
                onChange={(event) =>
                  setKeys((current) =>
                    current.map((item, itemIndex) => itemIndex === index ? event.target.value : item)
                  )
                }
                placeholder={configured ? "Configured — enter to replace" : "gsk_…"}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm"
              />
            </label>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Keys are encrypted before database storage and are never returned by the API. Saving replaces
        the stored fallback list; leave all fields empty to clear database-managed fallbacks.
      </p>
      {message && <p className="mt-3 text-sm">{message}</p>}
      <button
        type="button"
        onClick={save}
        disabled={busy}
        className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        {busy ? "Saving…" : "Save fallback keys"}
      </button>
    </div>
  );
}
