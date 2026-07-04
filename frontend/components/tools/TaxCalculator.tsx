"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";

export function TaxCalculator() {
  const [income, setIncome] = useState<string>("");
  const [deductions, setDeductions] = useState<string>("");
  const [result, setResult] = useState<{ oldTax: number, newTax: number } | null>(null);

  const calculateTax = () => {
    const grossIncome = parseFloat(income) || 0;
    const totalDeductions = parseFloat(deductions) || 0;

    // VERY simplified tax calculation for demonstration purposes
    const taxableOld = Math.max(0, grossIncome - totalDeductions);
    const taxableNew = grossIncome; // New regime has fewer deductions, assuming 0 here for simplicity

    // Old Regime (Under 60 years)
    let oldTax = 0;
    if (taxableOld > 250000) {
      if (taxableOld <= 500000) {
        oldTax = (taxableOld - 250000) * 0.05;
      } else if (taxableOld <= 1000000) {
        oldTax = 12500 + (taxableOld - 500000) * 0.20;
      } else {
        oldTax = 112500 + (taxableOld - 1000000) * 0.30;
      }
    }
    // Rebate 87A old regime
    if (taxableOld <= 500000) oldTax = 0;

    // New Regime (Default)
    let newTax = 0;
    if (taxableNew > 300000) {
      if (taxableNew <= 600000) {
        newTax = (taxableNew - 300000) * 0.05;
      } else if (taxableNew <= 900000) {
        newTax = 15000 + (taxableNew - 600000) * 0.10;
      } else if (taxableNew <= 1200000) {
        newTax = 45000 + (taxableNew - 900000) * 0.15;
      } else if (taxableNew <= 1500000) {
        newTax = 90000 + (taxableNew - 1200000) * 0.20;
      } else {
        newTax = 150000 + (taxableNew - 1500000) * 0.30;
      }
    }
    // Rebate 87A new regime (up to 7L)
    if (taxableNew <= 700000) newTax = 0;

    // Add 4% cess
    oldTax = oldTax * 1.04;
    newTax = newTax * 1.04;

    setResult({ oldTax, newTax });
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
          <Calculator className="size-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Old vs New Regime Calculator</h2>
          <p className="text-sm text-slate-500">Compare tax liability across both regimes</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Gross Total Income (Annual)</label>
          <input
            type="number"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="₹ 10,00,000"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Total Deductions (80C, 80D, etc.)</label>
          <input
            type="number"
            value={deductions}
            onChange={(e) => setDeductions(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="₹ 1,50,000"
          />
          <p className="mt-1 text-xs text-slate-500">Enter total old-regime deductions (excluding standard deduction, which is handled automatically for salaried individuals in a detailed calculator).</p>
        </div>

        <button
          onClick={calculateTax}
          className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Compare Regimes
        </button>

        {result && (
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className={`rounded-lg p-4 border ${result.oldTax <= result.newTax ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
              <h3 className="text-sm font-medium text-slate-700">Old Regime Tax</h3>
              <p className={`mt-1 text-xl font-bold ${result.oldTax <= result.newTax ? 'text-emerald-700' : 'text-slate-900'}`}>
                ₹ {Math.round(result.oldTax).toLocaleString('en-IN')}
              </p>
              {result.oldTax <= result.newTax && <p className="mt-2 text-xs font-semibold text-emerald-600">Recommended</p>}
            </div>
            <div className={`rounded-lg p-4 border ${result.newTax < result.oldTax ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
              <h3 className="text-sm font-medium text-slate-700">New Regime Tax</h3>
              <p className={`mt-1 text-xl font-bold ${result.newTax < result.oldTax ? 'text-emerald-700' : 'text-slate-900'}`}>
                ₹ {Math.round(result.newTax).toLocaleString('en-IN')}
              </p>
              {result.newTax < result.oldTax && <p className="mt-2 text-xs font-semibold text-emerald-600">Recommended</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
