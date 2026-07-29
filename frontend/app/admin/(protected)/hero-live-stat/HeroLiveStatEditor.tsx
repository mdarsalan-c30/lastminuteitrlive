"use client";

import { useState } from "react";

export function HeroLiveStatEditor({ initialValue }: { initialValue: number }) {
  const [value, setValue] = useState(String(initialValue));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch("/api/admin/hero-live-stat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseValue: Number(value) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save the stat.");
      setMessage(`Live stat reset to ${Number(value).toLocaleString("en-IN")}.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save the stat.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl space-y-5">
      <div>
        <label htmlFor="hero-live-stat" className="mb-2 block text-sm font-semibold">
          Current base number
        </label>
        <input
          id="hero-live-stat"
          type="number"
          min={0}
          max={100000000}
          step={1}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Saving resets the counter to this number. It then increases by 200 every 4 hours.
        </p>
      </div>
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {message}
        </p>
      )}
      <button
        type="button"
        disabled={saving}
        onClick={() => void save()}
        className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
      >
        {saving ? "Saving…" : "Publish live stat"}
      </button>
    </div>
  );
}
