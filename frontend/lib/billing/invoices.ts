/**
 * Invoicing for LastMinute ITR.
 *
 * Prices shown to users are GST-inclusive (per Terms), so each invoice backs
 * out 18% GST from the gross amount. Invoice numbers are sequential per
 * financial year, derived from the DB autoincrement `seq`.
 *
 * PAYMENT_API_TODO: once the live payment gateway is wired, buyer name/email
 * from the checkout billing form should be passed into createInvoiceForPayment.
 */

import { all, genId, insert, prisma } from "@/lib/db/store";
import { getPlan, normalizePlanId } from "@/lib/payments/plans";
import type { Invoice } from "@/lib/db/types";
import { BRAND_ICON_PATH } from "@/lib/brand";
import { absoluteUrl } from "@/lib/seo";

export const GST_RATE = 0.18;
const INVOICE_FY = "2026-27";

export const SELLER = {
  name: "LastMinute ITR",
  address: "India",
  email: "support@lastminuteitr.com",
  gstin: "27BOHPA6051D1ZD",
  sacCode: "998231", // Tax consultancy and preparation services
} as const;

export function formatInvoiceNumber(seq: number): string {
  return `LMI/${INVOICE_FY}/${String(seq).padStart(5, "0")}`;
}

export function splitGstInclusive(grossInr: number): {
  taxableInr: number;
  gstInr: number;
} {
  const taxableInr = Math.round(grossInr / (1 + GST_RATE));
  return { taxableInr, gstInr: grossInr - taxableInr };
}

export async function createInvoiceForPayment(input: {
  paymentId: string;
  plan: string;
  grossInr: number;
  sessionId?: string;
  buyerName?: string;
  buyerEmail?: string;
}): Promise<Invoice | null> {
  try {
    const planId = normalizePlanId(input.plan);
    const planName = planId ? getPlan(planId).name : input.plan;
    const { taxableInr, gstInr } = splitGstInclusive(input.grossInr);

    const invoice = await insert("invoices", {
      id: genId("inv"),
      paymentId: input.paymentId,
      plan: input.plan,
      planName,
      grossInr: input.grossInr,
      taxableInr,
      gstInr,
      gstRate: GST_RATE,
      buyerName: input.buyerName,
      buyerEmail: input.buyerEmail,
      sessionId: input.sessionId,
      status: "issued",
    });
    return serializeInvoice(invoice);
  } catch {
    // Unique paymentId constraint or DB issue — invoicing must never block payment.
    return null;
  }
}

function serializeInvoice(row: Record<string, unknown>): Invoice {
  return {
    ...(row as unknown as Invoice),
    ts:
      row.ts instanceof Date
        ? row.ts.toISOString()
        : String(row.ts ?? new Date().toISOString()),
  };
}

export async function listInvoices(): Promise<Invoice[]> {
  const rows = await all("invoices");
  return rows
    .map(serializeInvoice)
    .sort((a, b) => b.ts.localeCompare(a.ts));
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  const row = await prisma.invoice.findUnique({ where: { id } });
  return row ? serializeInvoice(row as unknown as Record<string, unknown>) : null;
}

export async function getInvoiceForSession(
  sessionId: string
): Promise<Invoice | null> {
  const row = await prisma.invoice.findFirst({
    where: { sessionId },
    orderBy: { ts: "desc" },
  });
  return row ? serializeInvoice(row as unknown as Record<string, unknown>) : null;
}

/** Printable HTML invoice — users save as PDF from the browser print dialog. */
export function renderInvoiceHtml(invoice: Invoice): string {
  const number = formatInvoiceNumber(invoice.seq);
  const date = new Date(invoice.ts).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  const logoUrl = absoluteUrl(BRAND_ICON_PATH);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Invoice ${number}</title>
<style>
  body { font-family: -apple-system, "Segoe UI", Roboto, sans-serif; color: #0f172a; margin: 0; padding: 40px; background: #f8fafc; }
  .sheet { max-width: 640px; margin: 0 auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 40px; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .muted { color: #64748b; font-size: 13px; }
  .row { display: flex; justify-content: space-between; margin-top: 24px; }
  table { width: 100%; border-collapse: collapse; margin-top: 24px; }
  th, td { text-align: left; padding: 10px 12px; font-size: 14px; border-bottom: 1px solid #e2e8f0; }
  th { background: #f1f5f9; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; color: #475569; }
  td.num, th.num { text-align: right; }
  .total td { font-weight: 700; border-bottom: none; }
  .brand-logo { height: 44px; width: 44px; margin-bottom: 8px; display: block; object-fit: contain; }
  @media print { body { background: #fff; padding: 0; } .sheet { border: none; } .no-print { display: none; } }
</style>
</head>
<body>
<div class="sheet">
  <div class="row" style="margin-top:0">
    <div>
      <img src="${logoUrl}" alt="LastminuteITR" class="brand-logo" />
      <h1>${SELLER.name}</h1>
      <p class="muted">${SELLER.address}<br/>${SELLER.email}${SELLER.gstin ? `<br/>GSTIN: ${SELLER.gstin}` : ""}</p>
    </div>
    <div style="text-align:right">
      <p style="font-weight:700;margin:0">TAX INVOICE</p>
      <p class="muted" style="margin:4px 0 0">Invoice no: <strong>${number}</strong><br/>Date: ${date}</p>
    </div>
  </div>

  <div class="row">
    <div>
      <p class="muted" style="margin:0 0 2px">Billed to</p>
      <p style="margin:0;font-weight:600">${invoice.buyerName || "Customer"}</p>
      ${invoice.buyerEmail ? `<p class="muted" style="margin:2px 0 0">${invoice.buyerEmail}</p>` : ""}
    </div>
    <div style="text-align:right">
      <p class="muted" style="margin:0 0 2px">Payment reference</p>
      <p style="margin:0;font-size:13px">${invoice.paymentId}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr><th>Description</th><th>SAC</th><th class="num">Amount</th></tr>
    </thead>
    <tbody>
      <tr>
        <td>${invoice.planName} — ITR filing assistance (AY 2026-27)</td>
        <td>${SELLER.sacCode}</td>
        <td class="num">${inr(invoice.taxableInr)}</td>
      </tr>
      <tr>
        <td>GST @ ${Math.round(invoice.gstRate * 100)}%</td>
        <td></td>
        <td class="num">${inr(invoice.gstInr)}</td>
      </tr>
      <tr class="total">
        <td>Total (GST inclusive)</td>
        <td></td>
        <td class="num">${inr(invoice.grossInr)}</td>
      </tr>
    </tbody>
  </table>

  <p class="footer">
    This is a computer-generated invoice and does not require a signature.
    LastMinute ITR provides filing assistance software; the return is submitted
    by you on incometax.gov.in. Invoices are retained for 8 years as required
    under the CGST Act.
  </p>
  <p class="no-print" style="margin-top:24px">
    <button onclick="window.print()" style="padding:10px 20px;border-radius:10px;border:1px solid #cbd5e1;background:#0f172a;color:#fff;font-weight:600;cursor:pointer">
      Print / Save as PDF
    </button>
  </p>
</div>
</body>
</html>`;
}
