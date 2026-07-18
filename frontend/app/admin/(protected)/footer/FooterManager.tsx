"use client";

import { useState } from "react";
import { Table, Td } from "../../_components/ui";

export function FooterManager({ initialLinks }: { initialLinks: any[] }) {
  const [links, setLinks] = useState(initialLinks);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    label: "",
    href: "",
    section: "Learn",
    order: 0,
    isExternal: false,
  });

  const resetForm = () => {
    setFormData({ label: "", href: "", section: "Learn", order: 0, isExternal: false });
    setIsAdding(false);
    setEditingId(null);
  };

  const startEdit = (link: any) => {
    setFormData({
      label: link.label,
      href: link.href,
      section: link.section,
      order: link.order,
      isExternal: link.isExternal,
    });
    setEditingId(link.id);
    setIsAdding(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = "/api/admin/footer";
      const method = editingId ? "PUT" : "POST";
      const body = editingId ? { ...formData, id: editingId } : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      
      if (res.ok) {
        const data = await res.json();
        if (editingId) {
          setLinks(prev => prev.map(l => l.id === editingId ? data.link : l));
        } else {
          setLinks(prev => [...prev, data.link]);
        }
        resetForm();
      } else {
        alert("Failed to save link");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving link");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this link?")) return;
    try {
      const res = await fetch(`/api/admin/footer?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setLinks(prev => prev.filter(l => l.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const sections = ["Learn", "Product", "Legal"];

  return (
    <div className="mt-6 space-y-6">
      <div className="flex justify-end">
        {!isAdding && !editingId && (
          <button onClick={() => setIsAdding(true)} className="rounded bg-slate-900 px-4 py-2 text-sm text-white">
            Add New Link
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
        <div className="p-4 border rounded-xl bg-slate-50">
          <h3 className="font-semibold mb-4">{editingId ? "Edit Link" : "Add Link"}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Label</label>
              <input required type="text" value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})} className="w-full border rounded p-2" placeholder="e.g. Blogs" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">URL (href)</label>
              <input required type="text" value={formData.href} onChange={e => setFormData({...formData, href: e.target.value})} className="w-full border rounded p-2" placeholder="e.g. /blogs" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Section</label>
              <select value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})} className="w-full border rounded p-2 bg-white">
                {sections.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sort Order</label>
              <input required type="number" value={formData.order} onChange={e => setFormData({...formData, order: parseInt(e.target.value) || 0})} className="w-full border rounded p-2" />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <input type="checkbox" id="ext" checked={formData.isExternal} onChange={e => setFormData({...formData, isExternal: e.target.checked})} />
              <label htmlFor="ext" className="text-sm font-medium">External link (opens in new tab)</label>
            </div>
            <div className="col-span-2 flex justify-end gap-2 pt-2">
              <button type="button" onClick={resetForm} className="px-4 py-2 text-sm border rounded hover:bg-slate-100">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm bg-slate-900 text-white rounded hover:bg-slate-800">Save</button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white">
        <Table headers={["Label", "URL", "Section", "Order", "External", "Actions"]}>
          {links.length === 0 ? (
            <tr>
              <Td colSpan={6} className="text-center py-6 text-slate-500">
                No footer links configured.
              </Td>
            </tr>
          ) : (
            links.map((link) => (
              <tr key={link.id}>
                <Td className="font-medium">{link.label}</Td>
                <Td className="text-slate-500">{link.href}</Td>
                <Td>{link.section}</Td>
                <Td>{link.order}</Td>
                <Td>{link.isExternal ? "Yes" : "No"}</Td>
                <Td className="space-x-3">
                  <button onClick={() => startEdit(link)} className="text-blue-600 hover:underline text-sm">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(link.id)} className="text-red-600 hover:underline text-sm">
                    Delete
                  </button>
                </Td>
              </tr>
            ))
          )}
        </Table>
      </div>
    </div>
  );
}
