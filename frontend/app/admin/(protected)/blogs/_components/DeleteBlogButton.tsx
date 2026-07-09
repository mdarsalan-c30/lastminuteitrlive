"use client";

import { useState } from "react";
import { deleteBlog } from "../actions";
import { useRouter } from "next/navigation";

export function DeleteBlogButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    
    setIsDeleting(true);
    try {
      await deleteBlog(id);
      router.refresh();
    } catch (err) {
      alert("Failed to delete blog post");
      setIsDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      disabled={isDeleting}
      className="text-red-600 hover:underline text-xs font-medium ml-2 disabled:opacity-50"
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}
