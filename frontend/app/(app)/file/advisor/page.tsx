"use client";

import { useRouter } from "next/navigation";
import { useDraftStore } from "@/lib/store/draft";
import { FilingLayout } from "@/components/filing/FilingLayout";
import { Button, FilingActions, ScreenTitle } from "@/components/filing/ui";
import { AIChatInterview } from "@/components/filing/AIChatInterview";

export default function AdvisorPage() {
  const router = useRouter();

  return (
    <FilingLayout
      variant="companion"
      mirrorText="Your Smart AI Tax Assistant provides real-time advisory on your tax deductions, saving opportunities, and mistakes."
    >
      <ScreenTitle
        title="Smart AI Tax Assistant"
        subtitle="Your personalized AI tax assistant to help you save more and file confidently."
      />

      <div className="mb-6 h-[550px] rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <AIChatInterview />
      </div>

      <FilingActions>
        <Button onClick={() => router.push("/file/checkout/plans")}>Continue to Plans & Pay</Button>
      </FilingActions>
    </FilingLayout>
  );
}
