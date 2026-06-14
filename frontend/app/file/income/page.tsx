"use client";

import { useDraftStore } from "@/lib/store/draft";
import { formatINR } from "@/lib/filing/types";
import { FilingLayout } from "@/components/filing/FilingLayout";
import {
  Button,
  FilingActions,
  Card,
  ScreenTitle,
} from "@/components/filing/ui";
import { WhyWeNeedThis } from "@/components/filing/OnboardingForm";
import { WhyWeAskHint } from "@/components/filing/WhyWeAskHint";
import { WHY_WE_ASK } from "@/lib/copy/trust";

export default function IncomePage() {
  const { income } = useDraftStore();

  return (
    <FilingLayout
      showNavRail
      activeNavSection="salary"
      mirrorText="Salary from Form 16 is pre-filled from your upload. Confirm employer name, gross salary, and TDS match your payslip before continuing."
    >
      <ScreenTitle
        title="Income workspace"
        subtitle="We've created a draft from your documents. Review each section once."
      />

      <WhyWeAskHint className="mb-4">{WHY_WE_ASK.salaryConfirm}</WhyWeAskHint>

      <WhyWeNeedThis>
        <p>
          Employer name, gross salary, and TDS here must match your Form 16 and what
          Form 26AS shows — the government portal rejects mismatches.
        </p>
      </WhyWeNeedThis>

      <Card>
        <p className="font-medium text-slate-900">{income.employer}</p>
        <p className="text-sm text-slate-600 mt-1">
          Gross: {formatINR(income.grossSalary)} · TDS: {formatINR(income.tds)}
        </p>
      </Card>

      <FilingActions>
        <Button href="/file/house-property">Save & continue</Button>
        <Button href="/file/import/documents?source=form16" variant="ghost">
          + Add another Form 16
        </Button>
      </FilingActions>
    </FilingLayout>
  );
}
