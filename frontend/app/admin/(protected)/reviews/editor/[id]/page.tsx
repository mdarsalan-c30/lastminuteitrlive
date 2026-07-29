"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "../../../../_components/ui";

export default function ReviewEditor({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const isNew = id === "new";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fetchingPhoto, setFetchingPhoto] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    city: "",
    quote: "",
    rating: 5,
    plan: "",
    outcomeTag: "",
    avatarUrl: "",
    profileUrl: "",
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
        if (data.review) {
          setFormData({
            name: data.review.name ?? "",
            role: data.review.role ?? "",
            city: data.review.city ?? "",
            quote: data.review.quote ?? "",
            rating: data.review.rating ?? 5,
            plan: data.review.plan ?? "",
            outcomeTag: data.review.outcomeTag ?? "",
            avatarUrl: data.review.avatarUrl ?? "",
            profileUrl: data.review.profileUrl ?? "",
            published: data.review.published !== false,
            order: data.review.order ?? 0,
          });
        }
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

  async function handleAvatarUpload(file: File) {
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/reviews/upload-avatar", {
        method: "POST",
        body,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload failed");
      setFormData((current) => ({ ...current, avatarUrl: data.url }));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function fetchProfilePhoto() {
    setFetchingPhoto(true);
    setError("");
    try {
      const response = await fetch("/api/admin/reviews/fetch-avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileUrl: formData.profileUrl }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to fetch profile photo");
      setFormData((current) => ({ ...current, avatarUrl: data.url }));
    } catch (fetchError) {
      setError(
        fetchError instanceof Error ? fetchError.message : "Unable to fetch profile photo"
      );
    } finally {
      setFetchingPhoto(false);
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

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Profile and photo</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Add a LinkedIn or other public professional profile. LinkedIn photo import is
            best-effort; manual upload is the reliable option.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-[96px_minmax(0,1fr)]">
            <div className="flex size-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#0e5f63]/10 shadow-sm">
              {formData.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={formData.avatarUrl}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold text-[#0e5f63]">
                  {formData.name
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0]?.toUpperCase())
                    .join("") || "?"}
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  LinkedIn or professional profile URL
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="url"
                    value={formData.profileUrl}
                    onChange={(event) =>
                      setFormData({ ...formData, profileUrl: event.target.value })
                    }
                    className="min-w-0 flex-1 rounded-md border border-slate-300 p-2 text-sm"
                    placeholder="https://www.linkedin.com/in/username"
                  />
                  <button
                    type="button"
                    disabled={fetchingPhoto || !formData.profileUrl}
                    onClick={() => void fetchProfilePhoto()}
                    className="rounded-md border border-[#0e5f63]/30 bg-white px-3 py-2 text-sm font-semibold text-[#0e5f63] disabled:opacity-50"
                  >
                    {fetchingPhoto ? "Fetching…" : "Fetch LinkedIn photo"}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Upload profile photo
                </label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  disabled={uploading}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void handleAvatarUpload(file);
                    event.currentTarget.value = "";
                  }}
                  className="block w-full rounded-md border border-slate-300 bg-white p-2 text-sm"
                />
                <p className="mt-1 text-xs text-slate-500">
                  PNG, JPG or WebP · maximum 3 MB.
                  {uploading ? " Uploading…" : ""}
                </p>
              </div>

              {formData.avatarUrl && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, avatarUrl: "" })}
                  className="text-left text-xs font-semibold text-red-600 hover:underline"
                >
                  Remove profile photo
                </button>
              )}
            </div>
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
