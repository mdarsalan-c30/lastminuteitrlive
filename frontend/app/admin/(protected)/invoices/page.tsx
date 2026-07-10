import { listInvoices, formatInvoiceNumber } from "@/lib/billing/invoices";
import { Card, PageHeader } from "../../_components/ui";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const invoices = await listInvoices();
  const totalGross = invoices
    .filter((i) => i.status === "issued")
    .reduce((sum, i) => sum + i.grossInr, 0);
  const totalGst = invoices
    .filter((i) => i.status === "issued")
    .reduce((sum, i) => sum + i.gstInr, 0);

  return (
    <div>
      <PageHeader
        title="Invoices"
        subtitle="GST invoices generated for every paid order"
      />

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card>
          <p className="text-xs uppercase text-muted-foreground">Invoices issued</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            {invoices.length}
          </p>
        </Card>
        <Card>
          <p className="text-xs uppercase text-muted-foreground">Gross billed</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            ₹{totalGross.toLocaleString("en-IN")}
          </p>
        </Card>
        <Card>
          <p className="text-xs uppercase text-muted-foreground">GST collected</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            ₹{totalGst.toLocaleString("en-IN")}
          </p>
        </Card>
      </div>

      {invoices.length === 0 ? (
        <Card>
          <p className="text-sm text-muted-foreground">
            No invoices yet. An invoice is created automatically the moment a
            payment is verified.
          </p>
        </Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                <th className="px-4 py-3">Invoice no</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3 text-right">Taxable</th>
                <th className="px-4 py-3 text-right">GST</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3 font-mono text-xs">
                    {formatInvoiceNumber(invoice.seq)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(invoice.ts).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </td>
                  <td className="px-4 py-3">{invoice.planName}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    ₹{invoice.taxableInr.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    ₹{invoice.gstInr.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">
                    ₹{invoice.grossInr.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        invoice.status === "issued"
                          ? "rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"
                          : "rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                      }
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`/api/admin/invoices/${invoice.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-blue-600 underline underline-offset-2"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
