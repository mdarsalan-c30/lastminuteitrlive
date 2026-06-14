"use client";

import { FilingLayout } from "@/components/filing/FilingLayout";
import {
  Banner,
  Button,
  FilingActions,
  FieldLabel,
  ScreenTitle,
  SelectInput,
  TrackerSteps,
} from "@/components/filing/ui";
import { EVERIFY_URGENCY } from "@/lib/copy/competitorInspired";
import { useState } from "react";

export default function EverifyPage() {
  const [method, setMethod] = useState("aadhaar_otp");

  return (
    <FilingLayout
      mirrorText="E-verification on incometax.gov.in is mandatory within 30 days of filing. Without it, your return is treated as invalid even if you paid tax."
    >
      <ScreenTitle
        title="E-verify on the gov portal"
        subtitle="After you file on incometax.gov.in, e-verification is required on the government site. We do not submit or verify returns for you."
      />

      <TrackerSteps
        steps={[
          { label: "Pay & unlock guide", status: "done" },
          { label: "File on portal", status: "current" },
          { label: "E-verify on portal", status: "pending" },
        ]}
      />

      <Banner variant="warning">
        <strong>{EVERIFY_URGENCY.headline}</strong> — {EVERIFY_URGENCY.body}
      </Banner>

      <div className="mb-4">
        <FieldLabel>Preferred e-verify method (for your reference)</FieldLabel>
        <SelectInput
          value={method}
          onChange={setMethod}
          options={[
            { value: "aadhaar_otp", label: "Aadhaar OTP (recommended)" },
            { value: "netbanking", label: "Net banking" },
            { value: "itr_v", label: "ITR-V by post" },
          ]}
        />
      </div>

      <Banner variant="info">{EVERIFY_URGENCY.methods}</Banner>

      <FilingActions>
        <Button href="/file/companion">Open filing guide</Button>
      </FilingActions>
    </FilingLayout>
  );
}
