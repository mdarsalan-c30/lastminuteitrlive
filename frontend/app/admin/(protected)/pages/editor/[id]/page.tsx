import { PageHeader } from "../../../../_components/ui";
import { prisma } from "@/lib/prisma";
import { PageEditorForm } from "./PageEditorForm";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PageEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";
  let page = null;

  if (!isNew) {
    page = await prisma.landingPage.findUnique({ where: { id } });
    if (!page) return notFound();
  }

  return (
    <div>
      <PageHeader 
        title={isNew ? "Create Landing Page" : "Edit Landing Page"} 
        subtitle="Write Markdown content and configure SEO metadata" 
        backHref="/admin/pages" 
      />
      <div className="mt-6 max-w-4xl">
        <PageEditorForm initialData={page} />
      </div>
    </div>
  );
}
