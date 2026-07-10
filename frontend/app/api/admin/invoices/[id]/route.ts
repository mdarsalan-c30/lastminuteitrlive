import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/rbac";
import { getInvoiceById, renderInvoiceHtml } from "@/lib/billing/invoices";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request, "viewDashboard");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const invoice = await getInvoiceById(id);
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  return new NextResponse(renderInvoiceHtml(invoice), {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
