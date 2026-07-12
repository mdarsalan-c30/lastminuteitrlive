"use client";

import { useState } from "react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../_components/ui";

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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6 text-slate-500">
                No landing pages yet.
              </TableCell>
            </TableRow>
          ) : (
            list.map((page) => (
              <TableRow key={page.id}>
                <TableCell className="font-medium">{page.title}</TableCell>
                <TableCell className="text-slate-500">/guide/{page.slug}</TableCell>
                <TableCell>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${page.published ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                    {page.published ? "Published" : "Draft"}
                  </span>
                </TableCell>
                <TableCell className="text-right space-x-3">
                  <Link href={`/admin/pages/editor/${page.id}`} className="text-blue-600 hover:underline text-sm">
                    Edit
                  </Link>
                  <button onClick={() => handleDelete(page.id)} className="text-red-600 hover:underline text-sm">
                    Delete
                  </button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
