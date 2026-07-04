"use client";

import { useState } from "react";
import { FileText } from "lucide-react";

export function RentReceiptGenerator() {
  const [tenantName, setTenantName] = useState("");
  const [landlordName, setLandlordName] = useState("");
  const [rentAmount, setRentAmount] = useState("");
  const [address, setAddress] = useState("");
  const [month, setMonth] = useState("");
  const [generated, setGenerated] = useState(false);

  const generateReceipt = () => {
    if (tenantName && landlordName && rentAmount && address && month) {
      setGenerated(true);
    }
  };

  return (
    <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: "#bfe9e0" }}>
      <div className="mb-6 flex items-center gap-3 border-b border-white/50 pb-4">
        <div className="flex items-center justify-center rounded-xl p-3 bg-white/60 shadow-sm">
          <FileText className="size-6" style={{ color: "#0e5f63" }} />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: "#0e5f63" }}>Rent Receipt Generator</h2>
          <p className="mt-1 text-sm font-medium opacity-80" style={{ color: "#0e5f63" }}>Generate valid rent receipts for HRA claims</p>
        </div>
      </div>

      {!generated ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-800">Tenant Name</label>
              <input
                type="text"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                className="w-full rounded-lg border border-white/50 bg-white/80 px-3 py-2 text-sm focus:outline-none focus:ring-2"
                style={{ outlineColor: "#0e5f63", "--tw-ring-color": "#0e5f63" } as any}
                placeholder="e.g. Rahul Kumar"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-800">Landlord Name</label>
              <input
                type="text"
                value={landlordName}
                onChange={(e) => setLandlordName(e.target.value)}
                className="w-full rounded-lg border border-white/50 bg-white/80 px-3 py-2 text-sm focus:outline-none focus:ring-2"
                style={{ outlineColor: "#0e5f63", "--tw-ring-color": "#0e5f63" } as any}
                placeholder="e.g. Amit Sharma"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-800">Monthly Rent Amount (₹)</label>
            <input
              type="number"
              value={rentAmount}
              onChange={(e) => setRentAmount(e.target.value)}
              className="w-full rounded-lg border border-white/50 bg-white/80 px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{ outlineColor: "#0e5f63", "--tw-ring-color": "#0e5f63" } as any}
              placeholder="e.g. 15000"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-800">Property Address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-lg border border-white/50 bg-white/80 px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{ outlineColor: "#0e5f63", "--tw-ring-color": "#0e5f63" } as any}
              placeholder="Full address of the rented property"
              rows={2}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-800">Receipt Month/Year</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full rounded-lg border border-white/50 bg-white/80 px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{ outlineColor: "#0e5f63", "--tw-ring-color": "#0e5f63" } as any}
            />
          </div>

          <button
            onClick={generateReceipt}
            disabled={!tenantName || !landlordName || !rentAmount || !address || !month}
            className="w-full rounded-lg py-3 mt-4 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "#0e5f63" }}
          >
            Generate Receipt
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-lg border-2 border-dashed p-6 bg-white" style={{ borderColor: "#0e5f63" }}>
            <h3 className="mb-4 text-center text-lg font-bold uppercase underline" style={{ color: "#0e5f63" }}>Rent Receipt</h3>
            <p className="mb-4 text-sm text-slate-800 leading-relaxed">
              Received sum of <strong>₹ {rentAmount}</strong> from <strong>{tenantName}</strong> towards the rent of property located at <strong>{address}</strong> for the period of <strong>{month}</strong>.
            </p>
            <div className="mt-8 flex justify-between text-sm">
              <div>
                <p className="mb-8 font-semibold text-slate-800">Date: _________________</p>
              </div>
              <div className="text-right">
                <p className="mb-8 font-semibold text-slate-400">(Signature)</p>
                <p className="font-bold text-slate-800">{landlordName}</p>
                <p className="text-slate-600">Landlord</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="w-full rounded-lg py-3 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#0e5f63" }}
          >
            Print Receipt
          </button>
          <button
            onClick={() => setGenerated(false)}
            className="w-full rounded-lg border bg-white py-3 text-sm font-bold shadow-sm transition-colors hover:bg-slate-50"
            style={{ borderColor: "#0e5f63", color: "#0e5f63" }}
          >
            Create Another
          </button>
        </div>
      )}
    </div>
  );
}
