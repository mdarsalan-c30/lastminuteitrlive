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
  FieldLabel,
  ScreenTitle,
  SelectInput,
} from "@/components/filing/ui";

export default function HousePropertyPage() {
  const { houseProperty, setHouseProperty } = useDraftStore();
  const type =
    houseProperty.propertyType === "none"
      ? "self_occupied"
      : houseProperty.propertyType;
  const [showHraModal, setShowHraModal] = useState(false);

  return (
    <FilingLayout
      showNavRail
      activeNavSection="house"
      mirrorText="Self-occupied homes usually show zero rent but let you claim home loan interest. Let-out property uses actual rent minus municipal tax and loan interest."
    >
      <ScreenTitle title="House property" />

      <PlainEnglishField
        govLabel="Schedule HP"
        simpleLabel="Home you own or rent out"
      />

      <PlainEnglishHelp
        summary="Pick the home type first, then add only the numbers that apply to you."
        points={[
          "Self-occupied means you live there; rent is usually zero.",
          "Let-out means you received rent from a tenant.",
          "Home loan interest is yearly interest, not principal.",
          "If you co-own the house, enter only your share.",
        ]}
      />

      <div className="mb-4">
        <FieldLabel>Type</FieldLabel>
        <SelectInput
          value={type}
          onChange={(value) =>
            setHouseProperty({
              propertyType: value as "self_occupied" | "let_out",
            })
          }
          options={[
            { value: "self_occupied", label: "Self-occupied" },
            { value: "let_out", label: "Let-out" },
          ]}
        />
      </div>

      {type === "let_out" && (
        <div className="mb-4">
          <FieldLabel>Annual rent received</FieldLabel>
          <input
            id="annualRent"
            type="number"
            value={houseProperty.annualRent || ""}
            onChange={(e) =>
              setHouseProperty({ annualRent: Number(e.target.value) || 0 })
            }
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Total rent for the year"
          />
        </div>
      )}

      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel>Home loan interest paid</FieldLabel>
          <input
            id="homeLoanInterest"
            type="number"
            value={houseProperty.homeLoanInterest || ""}
            onChange={(e) =>
              setHouseProperty({
                homeLoanInterest: Number(e.target.value) || 0,
              })
            }
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Annual interest (Section 24b)"
          />
        </div>
        <div>
          <FieldLabel>Municipal tax paid</FieldLabel>
          <input
            id="municipalTax"
            type="number"
            value={houseProperty.municipalTax || ""}
            onChange={(e) =>
              setHouseProperty({
                municipalTax: Number(e.target.value) || 0,
              })
            }
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Annual property tax"
          />
        </div>
        <div>
          <FieldLabel>Your ownership share (%)</FieldLabel>
          <input
            id="coOwnerPercent"
            type="number"
            min={1}
            max={100}
            value={houseProperty.coOwnerPercent}
            onChange={(e) =>
              setHouseProperty({
                coOwnerPercent: Math.min(
                  100,
                  Math.max(1, Number(e.target.value) || 100)
                ),
              })
            }
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <Banner variant="warning">
        If you claim HRA and home loan interest together, we will check both are
        allowed —{" "}
        <button
          type="button"
          onClick={() => setShowHraModal(true)}
          className="text-blue-600 underline"
        >
          Review
        </button>
      </Banner>

      <FilingActions>
        <Button href="/file/other">Save & continue</Button>
      </FilingActions>

      {showHraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="font-semibold text-slate-900 mb-2">
              HRA and home loan together
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              You claimed HRA (rent) and home loan interest on owned property.
              Both may be allowed in some cases — review carefully and keep proof.
            </p>
            <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 mb-4">
              Proof required
            </span>
            <Button onClick={() => setShowHraModal(false)} className="w-full">
              I understand
            </Button>
          </div>
        </div>
      )}
    </FilingLayout>
  );
}
