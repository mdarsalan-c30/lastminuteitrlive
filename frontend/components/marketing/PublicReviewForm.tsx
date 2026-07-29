"use client";

import { useState } from "react";
import { Star } from "lucide-react";

const EMPTY = {
  name: "",
  role: "",
  city: "",
  quote: "",
  rating: 5,
  plan: "",
  outcomeTag: "",
  profileUrl: "",
};
const INPUT =
  "min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0e5f63] focus:ring-2 focus:ring-[#0e5f63]/10";

export function PublicReviewForm() {
  const [form, setForm] = useState(EMPTY);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      const body = new FormData();
      Object.entries(form).forEach(([key, value]) => body.append(key, String(value)));
      body.append("website", "");
      if (photo) body.append("photo", photo);
      const response = await fetch("/api/reviews", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to submit your review.");
      setStatus("success");
      setForm(EMPTY);
      setPhoto(null);
      setPreview(null);
    } catch (submitError) {
      setStatus("idle");
      setError(submitError instanceof Error ? submitError.message : "Unable to submit your review.");
    }
  }

  if (status === "success") {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-emerald-200 bg-emerald-50 px-6 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-emerald-600 text-xl font-bold text-white">✓</div>
        <h3 className="mt-4 text-xl font-extrabold text-slate-900">Thank you for your review</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
          Your review is pending moderation and will appear publicly after approval.
        </p>
        <button type="button" onClick={() => setStatus("idle")} className="mt-5 text-sm font-bold text-[#0e5f63] hover:underline">
          Submit another review
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-[#f8faf9] p-5 shadow-sm sm:p-7">
      <label className="text-sm font-bold text-slate-800">Your rating *</label>
      <div className="mt-2 flex gap-1" role="group" aria-label="Review rating">
        {Array.from({ length: 5 }).map((_, index) => {
          const value = index + 1;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setForm({ ...form, rating: value })}
              className="rounded-lg p-1 transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e5f63]"
              aria-label={`${value} star${value === 1 ? "" : "s"}`}
            >
              <Star className={`size-7 ${value <= form.rating ? "fill-amber-400 text-amber-400" : "fill-white text-slate-300"}`} aria-hidden />
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Name *"><input required maxLength={80} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={INPUT} placeholder="Your name" /></Field>
        <Field label="Role"><input maxLength={80} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={INPUT} placeholder="e.g. Software Engineer" /></Field>
        <Field label="City"><input maxLength={80} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={INPUT} placeholder="e.g. Bengaluru" /></Field>
        <Field label="Filing plan">
          <select value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} className={INPUT}>
            <option value="">Select plan (optional)</option>
            <option value="Essential">Essential</option>
            <option value="Guided">Guided</option>
            <option value="Other">Other</option>
          </select>
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Your review *">
          <textarea required minLength={10} maxLength={700} value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} className={`${INPUT} min-h-32 resize-y`} placeholder="Tell others what worked well for you…" />
          <p className="mt-1 text-right text-xs text-slate-400">{form.quote.length}/700</p>
        </Field>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Outcome"><input maxLength={80} value={form.outcomeTag} onChange={(e) => setForm({ ...form, outcomeTag: e.target.value })} className={INPUT} placeholder="e.g. Easy document review" /></Field>
        <Field label="LinkedIn or professional profile">
          <input type="url" value={form.profileUrl} onChange={(e) => setForm({ ...form, profileUrl: e.target.value })} className={INPUT} placeholder="https://www.linkedin.com/in/..." />
        </Field>
      </div>

      <div className="mt-4">
        <label className="text-sm font-bold text-slate-800">Profile photo</label>
        <div className="mt-2 flex items-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-white p-4">
          <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0e5f63]/10 text-sm font-bold text-[#0e5f63]">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Profile preview" className="size-full object-cover" />
            ) : (
              form.name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "?"
            )}
          </div>
          <div className="min-w-0">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setPhoto(file);
                setPreview(file ? URL.createObjectURL(file) : null);
              }}
              className="block max-w-full text-sm text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-[#0e5f63]/10 file:px-3 file:py-2 file:text-xs file:font-bold file:text-[#0e5f63]"
            />
            <p className="mt-1 text-xs text-slate-400">PNG, JPG or WebP · maximum 3 MB</p>
          </div>
        </div>
      </div>

      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={status === "sending"} className="mt-6 min-h-12 w-full rounded-xl bg-[#0e5f63] px-5 text-sm font-extrabold text-white shadow-lg transition hover:bg-[#0b5154] disabled:opacity-50">
        {status === "sending" ? "Submitting review…" : "Submit review for approval"}
      </button>
      <p className="mt-3 text-center text-xs leading-5 text-slate-500">Your review and optional profile details become public only after moderation.</p>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold text-slate-800">{label}</span>{children}</label>;
}
