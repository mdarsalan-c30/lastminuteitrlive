"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrainCircuit, Loader2, Play, CheckCircle2, AlertTriangle, Code, LayoutList } from "lucide-react";
import type { ComputeResponse } from "@/lib/engine/types";
import { AIResults } from "./AIResults";

const MOCK_COMPLEX_SCENARIO = {
  "age": 35,
  "assessment_year": "2025-26",
  "residential_status": "resident",
  "mode": "estimate",
  "salary": {
    "gross_salary": 1800000,
    "basic_salary": 900000,
    "hra_received": 450000,
    "actual_rent_paid": 480000,
    "city_tier": "metro",
    "professional_tax": 2400
  },
  "deductions": {
    "epf": 108000,
    "elss": 30000,
    "health_insurance_self": 20000
  },
  "taxes_paid": {
    "tds_salary": 200000
  }
};

export function AIWorkspace({ contactId, initialStatus }: { contactId: string, initialStatus: string }) {
  const router = useRouter();
  const [inputJson, setInputJson] = useState(JSON.stringify(MOCK_COMPLEX_SCENARIO, null, 2));
  const [viewMode, setViewMode] = useState<"form" | "json">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<ComputeResponse | null>(null);
  const [filingLoading, setFilingLoading] = useState(false);

  const handleRunAI = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const parsed = JSON.parse(inputJson);
      const res = await fetch("/api/compute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Engine error");
      
      setResponse(data);
      
      // Mark as processed in DB
      await fetch("/api/ca/ai-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId })
      });
      router.refresh();
      
    } catch (err: any) {
      setError(err.message || "Invalid JSON");
    } finally {
      setLoading(false);
    }
  };

  const handleFileReturn = async () => {
    setFilingLoading(true);
    try {
      const res = await fetch("/api/ca/file-return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId, simulationMode: "success" })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Filing failed");
      alert("Return filed successfully! 1 Credit Deducted.");
      router.push("/ca/dashboard");
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setFilingLoading(false);
    }
  };

  // Helper to update JSON from form
  const updateField = (path: string[], value: any) => {
    try {
      const parsed = JSON.parse(inputJson);
      let current = parsed;
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) current[path[i]] = {};
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      setInputJson(JSON.stringify(parsed, null, 2));
    } catch (e) {
      // ignore if invalid json currently
    }
  };

  // Helper to get field from json for form
  const getField = (path: string[], defaultValue: any) => {
    try {
      const parsed = JSON.parse(inputJson);
      let current = parsed;
      for (let i = 0; i < path.length; i++) {
        if (current[path[i]] === undefined) return defaultValue;
        current = current[path[i]];
      }
      return current;
    } catch (e) {
      return defaultValue;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left side: Input */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <BrainCircuit className="size-5 text-purple-600" />
            Client Tax Data
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-200 p-1 rounded-lg">
              <button 
                onClick={() => setViewMode("form")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === "form" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                <LayoutList className="size-3.5" /> Form
              </button>
              <button 
                onClick={() => setViewMode("json")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === "json" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                <Code className="size-3.5" /> JSON
              </button>
            </div>
            <button 
              onClick={handleRunAI}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center disabled:opacity-50"
            >
              {loading ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Play className="size-4 mr-2" />}
              Run Engine
            </button>
          </div>
        </div>
        
        <div className="p-4 flex-1 flex flex-col">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100 flex items-start gap-2">
              <AlertTriangle className="size-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}
          
          {viewMode === "json" ? (
            <div className="flex-1 flex flex-col">
              <p className="text-xs text-slate-500 mb-2">Raw JSON payload for the TaxSathi Core Engine.</p>
              <textarea 
                value={inputJson}
                onChange={e => setInputJson(e.target.value)}
                className="flex-1 w-full bg-slate-900 text-green-400 font-mono text-sm p-4 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[500px]"
                spellCheck="false"
              />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
              {/* Basic Info */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Basic Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Age</label>
                    <input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-purple-500 outline-none" 
                      value={getField(["age"], "")} onChange={e => updateField(["age"], parseInt(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Assessment Year</label>
                    <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-purple-500 outline-none" 
                      value={getField(["assessment_year"], "")} onChange={e => updateField(["assessment_year"], e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Salary */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Salary Income</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Gross Salary</label>
                    <input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-purple-500 outline-none" 
                      value={getField(["salary", "gross_salary"], "")} onChange={e => updateField(["salary", "gross_salary"], parseInt(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Basic Salary</label>
                    <input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-purple-500 outline-none" 
                      value={getField(["salary", "basic_salary"], "")} onChange={e => updateField(["salary", "basic_salary"], parseInt(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">HRA Received</label>
                    <input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-purple-500 outline-none" 
                      value={getField(["salary", "hra_received"], "")} onChange={e => updateField(["salary", "hra_received"], parseInt(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Actual Rent Paid</label>
                    <input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-purple-500 outline-none" 
                      value={getField(["salary", "actual_rent_paid"], "")} onChange={e => updateField(["salary", "actual_rent_paid"], parseInt(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">City Tier</label>
                    <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-purple-500 outline-none bg-white"
                      value={getField(["salary", "city_tier"], "metro")} onChange={e => updateField(["salary", "city_tier"], e.target.value)}>
                      <option value="metro">Metro</option>
                      <option value="non-metro">Non-Metro</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Deductions (Chapter VI-A)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">EPF (80C)</label>
                    <input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-purple-500 outline-none" 
                      value={getField(["deductions", "epf"], "")} onChange={e => updateField(["deductions", "epf"], parseInt(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">ELSS (80C)</label>
                    <input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-purple-500 outline-none" 
                      value={getField(["deductions", "elss"], "")} onChange={e => updateField(["deductions", "elss"], parseInt(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Health Insurance (80D)</label>
                    <input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-purple-500 outline-none" 
                      value={getField(["deductions", "health_insurance_self"], "")} onChange={e => updateField(["deductions", "health_insurance_self"], parseInt(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">NPS (80CCD1B)</label>
                    <input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-purple-500 outline-none" 
                      value={getField(["deductions", "nps"], "")} onChange={e => updateField(["deductions", "nps"], parseInt(e.target.value) || 0)} />
                  </div>
                </div>
              </div>

              {/* Taxes Paid */}
              <div className="space-y-4 pb-4">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Taxes Already Paid</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">TDS on Salary</label>
                    <input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-purple-500 outline-none" 
                      value={getField(["taxes_paid", "tds_salary"], "")} onChange={e => updateField(["taxes_paid", "tds_salary"], parseInt(e.target.value) || 0)} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side: Results */}
      <div className="w-full lg:w-1/2 xl:w-3/5">
        {!response ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 min-h-[500px]">
            <BrainCircuit className="size-16 mb-4 text-slate-300" />
            <p className="font-semibold text-lg text-slate-600">Awaiting Tax Data</p>
            <p className="text-sm mt-1 text-center max-w-sm">Hit "Run Engine" to process the client's data and extract maximum refunds.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <AIResults response={response} />
            
            <div className="flex justify-end pt-4 border-t border-slate-200">
              <button 
                onClick={handleFileReturn}
                disabled={filingLoading || initialStatus === "won"}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-blue-200 flex items-center gap-2 disabled:opacity-50"
              >
                {filingLoading ? <Loader2 className="size-5 animate-spin" /> : <CheckCircle2 className="size-5" />}
                {initialStatus === "won" ? "Return Already Filed" : "Approve & File Return (1 Credit)"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
