"use client";

import { useState } from "react";

export interface HeroRibbonForm {
  enabled: boolean;
  imageUrl: string;
  linkUrl: string;
  altText: string;
  showOnMobile: boolean;
}

export function HeroRibbonEditor({ initial }: { initial: HeroRibbonForm }) {
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
      const response = await fetch("/api/admin/hero-ribbon/upload", {
        method: "POST",
        body,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload failed");
      setForm((current) => ({ ...current, imageUrl: data.url }));
      setMessage("Image uploaded. Click Publish ribbon to make it live.");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function publish() {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/hero-ribbon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Publish failed");
      setMessage("Hero ribbon published successfully.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Publish failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold">Ribbon image</label>
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
            PNG, JPG or WebP · maximum 3 MB · transparent background recommended.
          </p>
          {uploading && <p className="mt-2 text-sm text-primary">Uploading image…</p>}
        </div>

        <div>
          <label htmlFor="ribbon-image-url" className="mb-2 block text-sm font-semibold">
            Published image URL
          </label>
          <input
            id="ribbon-image-url"
            value={form.imageUrl}
            onChange={(event) =>
              setForm((current) => ({ ...current, imageUrl: event.target.value }))
            }
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="ribbon-link" className="mb-2 block text-sm font-semibold">
            Optional click destination
          </label>
          <input
            id="ribbon-link"
            value={form.linkUrl}
            placeholder="/file/checkout/plans or https://..."
            onChange={(event) =>
              setForm((current) => ({ ...current, linkUrl: event.target.value }))
            }
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="ribbon-alt" className="mb-2 block text-sm font-semibold">
            Accessible description
          </label>
          <input
            id="ribbon-alt"
            maxLength={160}
            value={form.altText}
            onChange={(event) =>
              setForm((current) => ({ ...current, altText: event.target.value }))
            }
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-5">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(event) =>
                setForm((current) => ({ ...current, enabled: event.target.checked }))
              }
            />
            Show ribbon
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={form.showOnMobile}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  showOnMobile: event.target.checked,
                }))
              }
            />
            Show on mobile
          </label>
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

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
              setForm({
                enabled: true,
                imageUrl: "/coupon-narnia.png",
                linkUrl: "",
                altText: "₹349 offer — use code NARNIA for 10% discount",
                showOnMobile: false,
              })
            }
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold"
          >
            Restore default
          </button>
          <button
            type="button"
            disabled={saving || uploading}
            onClick={() => void publish()}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {saving ? "Publishing…" : "Publish ribbon"}
          </button>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold">Preview</p>
        <div className="flex min-h-80 items-start justify-end overflow-hidden rounded-2xl border border-border bg-[#FAFAFB] p-4">
          {form.enabled ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.imageUrl || "/coupon-narnia.png"}
              alt={form.altText}
              className="h-auto w-64 rotate-3 drop-shadow-[0_12px_18px_rgba(14,95,99,0.18)]"
            />
          ) : (
            <p className="m-auto text-sm text-muted-foreground">Ribbon hidden</p>
          )}
        </div>
      </div>
    </div>
  );
}
