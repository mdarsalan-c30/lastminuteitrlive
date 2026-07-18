import { PageHeader } from "../../_components/ui";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AdminReviewsList } from "./AdminReviewsList";

export const dynamic = "force-dynamic";

export default async function AdminReviews() {
  const reviews = await prisma.review.findMany({
    orderBy: { order: "asc" }
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <PageHeader title="Reviews" subtitle="Manage customer testimonials" />
        <Link href="/admin/reviews/editor/new" className="rounded bg-slate-900 px-4 py-2 text-sm text-white">
          Add Review
        </Link>
      </div>
      <AdminReviewsList reviews={reviews} />
    </div>
  );
}
