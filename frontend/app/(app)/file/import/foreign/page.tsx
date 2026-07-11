"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FilingLayout } from "@/components/filing/FilingLayout";
import { Banner, Button, FilingActions, ScreenTitle } from "@/components/filing/ui";
import { useDraftStore } from "@/lib/store/draft";
import {
  residentialStatusFromDaysInIndia,
  SCHEDULE_FA_CHECKLIST,
  RSU_GUIDANCE,
} from "@/lib/tax/foreign";
import { formatINR } from "@/lib/format";

export default function ForeignImportPage() {
  const router = useRouter();
  const { ensureIncomeChip, setProfile, setQuestionAnswer } = useDraftStore();
  const [daysInIndia, setDaysInIndia] = useState(120);
  const [priorDays, setPriorDays] = useState(400);
  const [faChecked, setFaChecked] = useState<Record<string, boolean>>({});
  const [rsuVestingFmv, setRsuVestingFmv] = useState(0);

  const status = useMemo(
    () => residentialStatusFromDaysInIndia(daysInIndia, priorDays),
    [daysInIndia, priorDays]
  );

  const handleContinue = () => {
    ensureIncomeChip(status === "nri" || status === "rnor" ? "nri" : "foreign");
    ensureIncomeChip("foreign");
    setProfile({
      residentialStatus:
        status === "nri" ? "non_resident" : status === "rnor" ? "rnor" : "resident",
    });
    setQuestionAnswer("schedule_fa", {
      status,
      daysInIndia,
      checklist: faChecked,
      rsuVestingFmv,
    });
    router.push("/file/review?tab=income");
  };

  return (
    <FilingLayout mirrorText="Foreign income and assets need Schedule FA. We collect a simple checklist — you confirm each line on the portal.">
      <ScreenTitle
        title="NRI / foreign income & assets"
        subtitle="Tell us days in India and what you hold abroad. We route you to ITR-2 with Schedule FA."
      />

      <Banner variant="info">{RSU_GUIDANCE}</Banner>

      <div className="grid gap-3 sm:grid-cols-2 mb-4">
        <label className="text-sm">
          <span className="text-muted-foreground">Days in India this year</span>
          <input
            type="number"
            min={0}
            max={366}
            className="mt-1 w-full rounded-xl border border-border px-3 py-2"
            value={daysInIndia}
            onChange={(e) => setDaysInIndia(Number(e.target.value) || 0)}
          />
        </label>
        <label className="text-sm">
          <span className="text-muted-foreground">Days in India (prior 4 years, approx)</span>
          <input
            type="number"
            min={0}
            className="mt-1 w-full rounded-xl border border-border px-3 py-2"
            value={priorDays}
            onChange={(e) => setPriorDays(Number(e.target.value) || 0)}
          />
        </label>
      </div>

      <p className="mb-4 text-sm font-semibold">
        Suggested status:{" "}
        <span className="text-primary uppercase">{status}</span>
      </p>

      <label className="block text-sm mb-4">
        <span className="text-muted-foreground">RSU vesting-date FMV (if any)</span>
        <input
          type="number"
          min={0}
          className="mt-1 w-full rounded-xl border border-border px-3 py-2"
          value={rsuVestingFmv || ""}
          onChange={(e) => setRsuVestingFmv(Math.max(0, Number(e.target.value) || 0))}
        />
        {rsuVestingFmv > 0 && (
          <span className="text-xs text-muted-foreground">
            Recorded {formatINR(rsuVestingFmv)} as cost basis hint
          </span>
        )}
      </label>

      <h3 className="font-semibold mb-2">Schedule FA checklist</h3>
      <ul className="space-y-2 mb-6">
        {SCHEDULE_FA_CHECKLIST.map((item) => (
          <li key={item}>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={!!faChecked[item]}
                onChange={(e) =>
                  setFaChecked((prev) => ({ ...prev, [item]: e.target.checked }))
                }
              />
              <span>{item}</span>
            </label>
          </li>
        ))}
      </ul>

      <FilingActions>
        <Button onClick={handleContinue}>Continue to review</Button>
      </FilingActions>
    </FilingLayout>
  );
}
