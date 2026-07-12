import { PageHeader } from "../../_components/ui";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AdminPagesList } from "./AdminPagesList";

export const dynamic = "force-dynamic";

export default async function AdminPages() {
  const pages = await prisma.landingPage.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      published: true,
      createdAt: true,
    }
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <PageHeader title="Landing Pages" subtitle="Manage SEO guides and landing pages" />
        <Link href="/admin/pages/editor/new" className="rounded bg-slate-900 px-4 py-2 text-sm text-white">
          Create New Page
        </Link>
      </div>
      <AdminPagesList pages={pages} />
    </div>
  );
}
