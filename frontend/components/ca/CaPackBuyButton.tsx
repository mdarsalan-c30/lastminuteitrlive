"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RazorpayButton from "@/components/filing/checkout/RazorpayButton";
import type { PlanId } from "@/lib/payments/plans";

export function CaPackBuyButton({
  planId,
  label,
}: {
  planId: PlanId;
  label: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="w-full">
      <RazorpayButton
        planId={planId}
        onSuccess={() => {
          router.push("/ca/dashboard/billing?purchased=1");
          router.refresh();
        }}
        onError={setError}
        className="w-full min-h-11 rounded-xl bg-[#0e5f63] px-4 text-sm font-semibold text-white hover:bg-[#0a4a4d]"
      />
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <p className="mt-2 text-center text-xs text-slate-500">{label}</p>
    </div>
  );
}
