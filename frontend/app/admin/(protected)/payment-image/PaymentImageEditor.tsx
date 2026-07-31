"use client";

import { useState } from "react";

export interface PaymentImageForm {
  enabled: boolean;
  imageUrl: string;
  altText: string;
}

const fallback: PaymentImageForm = {
  enabled: true,
  imageUrl: "/images/payment/filing-assistant.png",
  altText: "Filing assistant holding a laptop",
};

export function PaymentImageEditor({ initial }: { initial: PaymentImageForm }) {
  const [form, setForm] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setUploading(true);
    setError(null);
    setMessage(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/payment-image/upload", {
        method: "POST",
        body,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload failed");
      setForm((current) => ({ ...current, imageUrl: data.url }));
      setMessage("Image uploaded. Click Save payment image to make it live.");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/payment-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Save failed");
      setMessage("Payment image updated successfully.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold">Payment page image</label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={uploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
              event.currentTarget.value = "";
            }}
            className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            PNG, JPG or WebP · maximum 3 MB. A portrait image works best.
          </p>
          {uploading && <p className="mt-2 text-sm text-primary">Uploading image…</p>}
        </div>

        <div>
          <label htmlFor="payment-image-alt" className="mb-2 block text-sm font-semibold">
            Accessible description
          </label>
          <input
            id="payment-image-alt"
            maxLength={160}
            value={form.altText}
            onChange={(event) =>
              setForm((current) => ({ ...current, altText: event.target.value }))
            }
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(event) =>
              setForm((current) => ({ ...current, enabled: event.target.checked }))
            }
          />
          Show image on payment page
        </label>

        {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {message && <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}

        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => setForm(fallback)} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold">
            Restore default
          </button>
          <button type="button" disabled={saving || uploading} onClick={() => void save()} className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
            {saving ? "Saving…" : "Save payment image"}
          </button>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold">Preview</p>
        <div className="flex min-h-80 items-center justify-center overflow-hidden rounded-2xl border border-border bg-[#f7fbfa] p-4">
          {form.enabled ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.imageUrl || fallback.imageUrl} alt={form.altText} className="max-h-80 w-auto rounded-xl object-contain" />
          ) : (
            <p className="text-sm text-muted-foreground">Image hidden</p>
          )}
        </div>
      </div>
    </div>
  );
}
