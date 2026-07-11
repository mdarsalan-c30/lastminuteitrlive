import { NextRequest, NextResponse } from "next/server";
import { getPaymentSessionFromRequest } from "@/lib/payments/sessionRequest";
import {
  getInvoiceForSession,
  renderInvoiceHtml,
  formatInvoiceNumber,
} from "@/lib/billing/invoices";

/**
 * Returns the current user's latest invoice (resolved from the verified
 * payment-session cookie). `?format=html` renders the printable invoice.
 */
export async function GET(request: NextRequest) {
  const session = getPaymentSessionFromRequest(request);
  if (!session?.sessionId) {
    return NextResponse.json(
      { error: "No verified payment session" },
      { status: 401 }
    );
  }

  const invoice = await getInvoiceForSession(session.sessionId);
  if (!invoice) {
    return NextResponse.json(
      { error: "No invoice found for this session" },
      { status: 404 }
    );
  }

  const format = request.nextUrl.searchParams.get("format");
  if (format === "html") {
    return new NextResponse(renderInvoiceHtml(invoice), {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  return NextResponse.json({
    invoice: { ...invoice, invoiceNumber: formatInvoiceNumber(invoice.seq) },
  });
}
