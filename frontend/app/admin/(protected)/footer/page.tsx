import { PageHeader } from "../../_components/ui";
import { prisma } from "@/lib/prisma";
import { FooterManager } from "./FooterManager";

export const dynamic = "force-dynamic";

export default async function AdminFooter() {
  const links = await prisma.footerLink.findMany({
    orderBy: [{ section: "asc" }, { order: "asc" }]
  });

  return (
    <div>
      <PageHeader 
        title="Footer Links" 
        subtitle="Manage the global site footer sections and links" 
      />
      <FooterManager initialLinks={links} />
    </div>
  );
}
