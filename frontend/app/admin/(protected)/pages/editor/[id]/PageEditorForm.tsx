"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PageEditorForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    seoKeywords: initialData?.seoKeywords || "",
    seoDescription: initialData?.seoDescription || "",
    bodyMarkdown: initialData?.bodyMarkdown || "",
    published: initialData?.published || false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = "/api/admin/pages";
      const method = initialData ? "PUT" : "POST";
      const body = initialData ? { ...formData, id: initialData.id } : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        router.push("/admin/pages");
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save page");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Slug (URL path)</label>
          <input required type="text" name="slug" value={formData.slug} onChange={handleChange} className="w-full border rounded p-2" placeholder="e.g. how-to-file" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Short Description (Internal)</label>
        <input type="text" name="description" value={formData.description} onChange={handleChange} className="w-full border rounded p-2" />
      </div>
      
      <div className="border p-4 rounded bg-slate-50 space-y-4">
        <h3 className="font-semibold text-sm">SEO Configuration</h3>
        <div>
          <label className="block text-sm font-medium mb-1">SEO Title (Defaults to Title if empty)</label>
          <input type="text" name="seoTitle" className="w-full border rounded p-2 bg-slate-100" disabled placeholder="Coming soon..." />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">SEO Keywords (Comma separated)</label>
          <input type="text" name="seoKeywords" value={formData.seoKeywords} onChange={handleChange} className="w-full border rounded p-2" placeholder="itr filing, online tax, last minute" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">SEO Description</label>
          <textarea name="seoDescription" value={formData.seoDescription} onChange={handleChange} className="w-full border rounded p-2 h-20" placeholder="Meta description for search engines..." />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Content (Markdown)</label>
        <textarea required name="bodyMarkdown" value={formData.bodyMarkdown} onChange={handleChange} className="w-full border rounded p-2 font-mono text-sm h-96" placeholder="# Heading 1\n\nContent here..." />
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="published" name="published" checked={formData.published} onChange={handleChange} />
        <label htmlFor="published" className="text-sm font-medium">Publish immediately (visible to public)</label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button type="button" onClick={() => router.back()} className="px-4 py-2 text-sm border rounded hover:bg-slate-50">Cancel</button>
        <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-slate-900 text-white rounded hover:bg-slate-800 disabled:opacity-50">
          {loading ? "Saving..." : "Save Page"}
        </button>
      </div>
    </form>
  );
}
