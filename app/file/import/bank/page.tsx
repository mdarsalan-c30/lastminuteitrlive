"use client";

import { FilingLayout } from "@/components/filing/FilingLayout";
import { PlainEnglishField } from "@/components/filing/PlainEnglishField";
import { Button, FilingActions, ScreenTitle } from "@/components/filing/ui";

export default function BankPage() {
  return (
    <FilingLayout
      mirrorText="Refunds are credited only to a validated bank account. Wrong IFSC or account number delays your refund by weeks."
    >
      <ScreenTitle
        title="Bank & contact"
        subtitle="Refunds go to this account. We validate it before you file."
      />

      <PlainEnglishField
        govLabel="Bank account number"
        simpleLabel="Account number"
        value="XXXX1234"
        glossaryTerm="bank account"
      />
      <PlainEnglishField
        govLabel="Indian Financial System Code"
        simpleLabel="IFSC"
        value="HDFC0001234"
        helper="HDFC Bank — validated for refund"
        glossaryTerm="IFSC"
      />
      <PlainEnglishField
        govLabel="Residential address"
        simpleLabel="Address"
        value="Pre-filled from PAN"
      />

      <FilingActions>
        <Button href="/file/import/mismatch">Save & reconcile</Button>
      </FilingActions>
    </FilingLayout>
  );
}
