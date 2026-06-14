"use client";

import { useState } from "react";
import { FilingLayout } from "@/components/filing/FilingLayout";
import { PlainEnglishField } from "@/components/filing/PlainEnglishField";
import { PlainEnglishHelp } from "@/components/filing/PlainEnglishHelp";
import { useDraftStore } from "@/lib/store/draft";
import {
  Banner,
  Button,
  FilingActions,
  ScreenTitle,
  SelectInput,
} from "@/components/filing/ui";
import { Home, Landmark, ShieldCheck, Info } from "lucide-react";

export default function HousePropertyPage() {
  const { houseProperty, setHouseProperty, setActiveField } = useDraftStore();
  const [showHraModal, setShowHraModal] = useState(false);

  const propertyType = houseProperty.propertyType || "none";

  return (
    <FilingLayout
      showNavRail
      activeNavSection="house"
      mirrorText="Self-occupied homes let you claim home loan interest deductions. Let-out properties use rental earnings minus local taxes and loan interest."
    >
      <div className="space-y-6">
        {/* Page Title & Context */}
        <ScreenTitle 
          title="House Property Income" 
          subtitle="Declare house occupancy details, municipal tax paid, and housing loan interest deductions."
        />

        <PlainEnglishHelp
          summary="Specify your home type first, then enter only the values that apply to your situation."
          points={[
            "Self-occupied: The home you live in. Rental income is zero.",
            "Let-out: The property you have rented out to tenants.",
            "Home loan interest: Claim annual interest paid (Section 24b).",
            "Co-ownership: Enter your legal share % to split calculations.",
          ]}
        />

        {/* Form Container */}
        <div className="bg-slate-50/20 border border-slate-100 rounded-2xl p-5 md:p-6 shadow-sm space-y-5">
          {/* Section Indicator */}
          <div className="pb-3 border-b border-slate-100/80 flex items-center gap-2">
            <Home className="size-4.5 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Occupancy & Co-Ownership
            </h3>
          </div>

          {/* Property Occupancy Select */}
          <PlainEnglishField
            govLabel="Schedule HP - Income from House Property occupancy status"
            simpleLabel="Property Occupancy Type"
            fieldId="propertyType"
          >
            <SelectInput
              value={propertyType}
              onChange={(value) =>
                setHouseProperty({
                  propertyType: value as "none" | "self_occupied" | "let_out",
                })
              }
              options={[
                { value: "none", label: "No House Property" },
                { value: "self_occupied", label: "Self-occupied (I live here)" },
                { value: "let_out", label: "Let-out (Rented to tenant)" },
              ]}
              onFocus={() => setActiveField?.("propertyType")}
            />
          </PlainEnglishField>

          {propertyType !== "none" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 pt-3 animate-in fade-in duration-300">
              
              {/* Ownership Share */}
              <div className="col-span-1 md:col-span-2">
                <PlainEnglishField
                  govLabel="Share of co-ownership percentage in property"
                  simpleLabel="Your Ownership Share (%)"
                  placeholder="100"
                  type="number"
                  fieldId="coOwnerPercent"
                  value={String(houseProperty.coOwnerPercent ?? 100)}
                  onChange={(v) => {
                    const pct = Math.min(100, Math.max(1, Number(v) || 100));
                    setHouseProperty({ coOwnerPercent: pct });
                  }}
                  helper="Your legal share of ownership. The engine will scale all rent and deductions accordingly."
                />
              </div>

              {/* Rented Out Inputs */}
              {propertyType === "let_out" && (
                <>
                  <div className="col-span-1 md:col-span-2 pb-3 mb-4 mt-4 border-b border-slate-100/80 flex items-center gap-2">
                    <Landmark className="size-4.5 text-blue-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Rental Income Details
                    </h3>
                  </div>

                  <PlainEnglishField
                    govLabel="Annual rent received or receivable (Gross rent)"
                    simpleLabel="Annual Rent Received"
                    placeholder="0"
                    type="number"
                    fieldId="annualRent"
                    value={houseProperty.annualRent ? String(houseProperty.annualRent) : ""}
                    onChange={(v) => setHouseProperty({ annualRent: Number(v) || 0 })}
                    helper="Sum of rent received. The engine automatically deducts 30% for standard repairs."
                  />

                  <PlainEnglishField
                    govLabel="Municipal taxes paid to local authorities during the year"
                    simpleLabel="Municipal Tax Paid"
                    placeholder="0"
                    type="number"
                    fieldId="municipalTax"
                    value={houseProperty.municipalTax ? String(houseProperty.municipalTax) : ""}
                    onChange={(v) => setHouseProperty({ municipalTax: Number(v) || 0 })}
                    helper="Only enter property taxes actually paid. Unpaid dues cannot be subtracted."
                  />
                </>
              )}

              {/* Loan Interest Section */}
              <div className="col-span-1 md:col-span-2 pb-3 mb-4 mt-4 border-b border-slate-100/80 flex items-center gap-2">
                <Landmark className="size-4.5 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Housing Loan Benefits (Section 24b)
                </h3>
              </div>

              <div className="col-span-1 md:col-span-2">
                <PlainEnglishField
                  govLabel="Interest payable on borrowed capital (Home loan interest)"
                  simpleLabel="Home Loan Interest Paid"
                  placeholder="0"
                  type="number"
                  fieldId="homeLoanInterest"
                  value={houseProperty.homeLoanInterest ? String(houseProperty.homeLoanInterest) : ""}
                  onChange={(v) => setHouseProperty({ homeLoanInterest: Number(v) || 0 })}
                  helper="Yearly interest portion from your housing loan interest certificate (capped at ₹2 Lakhs for Self-occupied)."
                />
              </div>

            </div>
          )}
        </div>

        {/* Dual Claim Banner */}
        {propertyType !== "none" && houseProperty.homeLoanInterest > 0 && (
          <Banner variant="warning">
            You have declared housing loan interest. If you are also claiming HRA exemption, 
            ensure they are in different locations or you meet genuine exceptions to avoid notices.{" "}
            <button
              type="button"
              onClick={() => setShowHraModal(true)}
              className="text-blue-600 font-bold hover:underline"
            >
              Review Rules
            </button>
          </Banner>
        )}

        {/* Audit Safe Info Box */}
        <div className="flex gap-3 bg-emerald-50/50 border border-emerald-100/60 rounded-xl p-4 text-xs text-emerald-800 leading-normal">
          <ShieldCheck className="size-4.5 shrink-0 text-emerald-600 mt-0.5" />
          <p>
            Standard repairs deduction (30% under Sec 24a) for let-out property is auto-calculated by the 
            tax engine. Double-check your numbers to ensure a smooth audit check.
          </p>
        </div>

        {/* Actions */}
        <FilingActions>
          <Button href="/file/other" className="w-full sm:w-auto">
            Save & Continue
          </Button>
        </FilingActions>

        {/* Interactive HRA Modal */}
        {showHraModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="max-w-md w-full rounded-2xl bg-white p-6 shadow-xl border border-slate-100 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="flex size-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Info className="size-4" />
                </span>
                <h3 className="font-bold text-slate-900 text-base">
                  HRA & Home Loan Rules
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                You can claim both HRA (rent paid) and Home Loan Interest deductions only if:
              </p>
              <ul className="text-xs text-slate-500 space-y-2 list-disc pl-5 mb-4 leading-relaxed">
                <li>Your owned property is in a different city due to your job placement.</li>
                <li>Your house is let out and you live in a rented place in the same/different city.</li>
                <li>Your house is self-occupied but you stay in rented accommodation due to commute/work reasons.</li>
              </ul>
              <div className="inline-flex rounded-lg bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-800 mb-4">
                Keep both home loan certificates and rent receipts safe.
              </div>
              <Button onClick={() => setShowHraModal(false)} className="w-full">
                I Understand
              </Button>
            </div>
          </div>
        )}
      </div>
    </FilingLayout>
  );
}
