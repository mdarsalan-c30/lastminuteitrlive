"use client";

import { useRouter } from "next/navigation";
import { useDraftStore } from "@/lib/store/draft";
import { FilingLayout } from "@/components/filing/FilingLayout";
import { Button, FilingActions, ScreenTitle } from "@/components/filing/ui";
import { AIChatInterview } from "@/components/filing/AIChatInterview";
import { FILING_HELP, FILING_TERMS } from "@/lib/copy/filingTerms";

export default function AdvisorPage() {
  const router = useRouter();
  const markGuidedCheckComplete = useDraftStore((s) => s.markGuidedCheckComplete);

  return (
    <FilingLayout
      variant="companion"
      mirrorText="Review questions about your draft in plain language. The assistant can point out items to check, but you decide what to claim and file."
    >
      <ScreenTitle
        title={FILING_TERMS.guidedTaxCheck}
        subtitle="Review possible missing information and ask questions about the tax details in your draft."
        helpText={FILING_HELP.check}
      />

      <div className="mb-6 h-[550px] rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <AIChatInterview />
      </div>

      <FilingActions>
        <Button
          onClick={() => {
            markGuidedCheckComplete();
            router.push("/file/review/risk#final-check");
          }}
        >
          Continue to Final Review
        </Button>
      </FilingActions>
    </FilingLayout>
  );
}
