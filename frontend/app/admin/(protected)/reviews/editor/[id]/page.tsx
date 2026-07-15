"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "../../../_components/ui";

export default function ReviewEditor({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const isNew = id === "new";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    city: "",
    quote: "",
    rating: 5,
    plan: "",
    outcomeTag: "",
    published: true,
    order: 0,
  });

  useEffect(() => {
    if (isNew) {
      setLoading(false);
      return;
    }
    fetch(`/api/admin/reviews?id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.review) setFormData(data.review);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id, isNew]);

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/reviews", {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, id: isNew ? undefined : id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save");
      router.push("/admin/reviews");
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  }

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-3xl pb-24">
      <div className="flex items-center justify-between mb-8">
        <PageHeader title={isNew ? "New Review" : "Edit Review"} />
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded bg-slate-900 px-6 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      {error && <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-600">{error}</div>}

      <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-md border border-slate-300 p-2 text-sm"
              placeholder="e.g. Rahul S."
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Role</label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full rounded-md border border-slate-300 p-2 text-sm"
              placeholder="e.g. Software Engineer"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full rounded-md border border-slate-300 p-2 text-sm"
              placeholder="e.g. Bengaluru"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Rating (1-5)</label>
            <input
              type="number"
              min="1"
              max="5"
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) || 5 })}
              className="w-full rounded-md border border-slate-300 p-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Quote *</label>
          <textarea
            value={formData.quote}
            onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
            className="h-32 w-full rounded-md border border-slate-300 p-2 text-sm"
            placeholder="Review text..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Plan Tag</label>
            <input
              type="text"
              value={formData.plan}
              onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
              className="w-full rounded-md border border-slate-300 p-2 text-sm"
              placeholder="e.g. Plus Plan"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Outcome Tag</label>
            <input
              type="text"
              value={formData.outcomeTag}
              onChange={(e) => setFormData({ ...formData, outcomeTag: e.target.value })}
              className="w-full rounded-md border border-slate-300 p-2 text-sm"
              placeholder="e.g. Refund Received"
            />
          </div>
        </div>

        <div className="flex items-center gap-6 pt-4 border-t border-slate-100">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            Published
          </label>
          <div className="flex items-center gap-2 text-sm">
            <label className="font-medium text-slate-700">Display Order</label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              className="w-20 rounded-md border border-slate-300 p-1 px-2 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
