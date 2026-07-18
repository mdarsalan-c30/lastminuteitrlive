"use client";

import { useState } from "react";
import Link from "next/link";
import { Table, Td } from "../../_components/ui";

export function AdminPagesList({ pages }: { pages: any[] }) {
  const [list, setList] = useState(pages);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this page?")) return;
    try {
      const res = await fetch(`/api/admin/pages?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setList((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white">
      <Table headers={["Title", "Slug", "Status", "Actions"]}>
        {list.length === 0 ? (
          <tr>
            <Td className="text-center py-6 text-slate-500" colSpan={4}>
              No landing pages yet.
            </Td>
          </tr>
        ) : (
          list.map((page) => (
            <tr key={page.id} className="hover:bg-slate-50">
              <Td className="font-medium">{page.title}</Td>
              <Td className="text-slate-500">/guide/{page.slug}</Td>
              <Td>
                <span className={`px-2 py-0.5 rounded-full text-xs ${page.published ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                  {page.published ? "Published" : "Draft"}
                </span>
              </Td>
              <Td className="space-x-3">
                <Link href={`/admin/pages/editor/${page.id}`} className="text-blue-600 hover:underline text-sm">
                  Edit
                </Link>
                <button onClick={() => handleDelete(page.id)} className="text-red-600 hover:underline text-sm">
                  Delete
                </button>
              </Td>
            </tr>
          ))
        )}
      </Table>
    </div>
  );
}
