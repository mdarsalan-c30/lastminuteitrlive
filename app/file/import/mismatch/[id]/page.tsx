"use client";

import { useParams, useRouter } from "next/navigation";
import { useDraftStore } from "@/lib/store/draft";
import { formatINR } from "@/lib/filing/types";
import { FilingLayout } from "@/components/filing/FilingLayout";
import {
  Button,
  Card,
  FilingActions,
  ScreenTitle,
} from "@/components/filing/ui";

const MISMATCH_COPY: Record<string, { title: string; body: string }> = {
  salary: {
    title: "Salary mismatch",
    body: "Your Form 16 shows salary. AIS may show a different amount. File using Form 16 if it is correct, and keep proof ready.",
  },
};

export default function MismatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);
  const { income, setMismatchResolved } = useDraftStore();

  const copy = MISMATCH_COPY[id] ?? {
    title: `${id} mismatch`,
    body: "Review the sources and update your draft to match your documents.",
  };

  const handleResolve = () => {
    setMismatchResolved(true);
    router.push("/file/import/mismatch");
  };

  return (
    <FilingLayout
      mirrorText="When Form 16 and AIS disagree, file using the document you can prove. Keep payslips and bank statements ready if ITD asks."
    >
      <ScreenTitle title={copy.title} subtitle={copy.body.replace("salary", formatINR(income.grossSalary))} />

      <Card>
        <h3 className="font-semibold text-slate-900 mb-3">Suggested action</h3>
        <ol className="text-sm text-slate-700 space-y-2 list-decimal list-inside">
          <li>Check Form 16 Part B</li>
          <li>Submit AIS feedback if AIS is wrong</li>
          <li>Update draft to match your documents</li>
        </ol>
      </Card>

      <details className="mb-4 text-sm">
        <summary className="cursor-pointer font-medium text-blue-600">
          How to fix on incometax.gov.in
        </summary>
        <ol className="mt-2 text-slate-600 space-y-1 list-decimal list-inside">
          <li>Log in to incometax.gov.in</li>
          <li>Go to Services → AIS</li>
          <li>Select the entry and submit feedback</li>
        </ol>
      </details>

      <FilingActions>
        <Button onClick={handleResolve}>Mark resolved with proof</Button>
        <Button href="/file/import/mismatch" variant="ghost">
          Back
        </Button>
      </FilingActions>

    </FilingLayout>
  );
}
