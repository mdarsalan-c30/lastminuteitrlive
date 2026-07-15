"use client";

import { useState } from "react";
import Link from "next/link";
import { Table, Td } from "../../_components/ui";

export function AdminReviewsList({ reviews }: { reviews: any[] }) {
  const [list, setList] = useState(reviews);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setList((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white">
      <Table headers={["Name", "Quote", "Rating", "Status", "Order", "Actions"]}>
        {list.length === 0 ? (
          <tr>
            <Td className="text-center py-6 text-slate-500" colSpan={6}>
              No reviews yet.
            </Td>
          </tr>
        ) : (
          list.map((review) => (
            <tr key={review.id} className="hover:bg-slate-50">
              <Td className="font-medium">{review.name}</Td>
              <Td className="text-slate-500 truncate max-w-xs">
                <span title={review.quote}>{review.quote}</span>
              </Td>
              <Td>{review.rating} ⭐</Td>
              <Td>
                <span className={`px-2 py-0.5 rounded-full text-xs ${review.published ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                  {review.published ? "Published" : "Hidden"}
                </span>
              </Td>
              <Td>{review.order}</Td>
              <Td className="space-x-3">
                <Link href={`/admin/reviews/editor/${review.id}`} className="text-blue-600 hover:underline text-sm">
                  Edit
                </Link>
                <button onClick={() => handleDelete(review.id)} className="text-red-600 hover:underline text-sm">
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
