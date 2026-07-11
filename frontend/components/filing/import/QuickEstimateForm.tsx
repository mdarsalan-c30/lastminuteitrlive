"use client";

import { FieldLabel, ResetStepButton, TextInput } from "@/components/filing/ui";
import { formatINR } from "@/lib/format";
import { useGenieFocus } from "@/lib/filing/useGenieFocus";

function parseAmount(value: string): number {
  const digits = value.replace(/\D/g, "");
  return digits.length > 0 ? parseInt(digits, 10) : 0;
}

function formatAmountInput(value: number): string {
  return value > 0 ? value.toLocaleString("en-IN") : "";
}

export interface QuickEstimateValues {
  grossSalary: number;
  tds: number;
  section80C: number;
  section80D: number;
  /** Business / freelance receipts — shown only for business-income filers. */
  businessReceipts: number;
}

export const EMPTY_QUICK_ESTIMATE: QuickEstimateValues = {
  grossSalary: 0,
  tds: 0,
  section80C: 0,
  section80D: 0,
  businessReceipts: 0,
};

interface QuickEstimateFormProps {
  values: QuickEstimateValues;
  onChange: (values: QuickEstimateValues) => void;
  /** Show the business / freelance receipts field (ITR-3/ITR-4 filers). */
  showBusiness?: boolean;
}

export function QuickEstimateForm({ values, onChange, showBusiness }: QuickEstimateFormProps) {
  const grossFocus = useGenieFocus("gross_salary");
  const tdsFocus = useGenieFocus("tds");
  const c80Focus = useGenieFocus("section80c");
  const d80Focus = useGenieFocus("section80d");

  const update = (patch: Partial<QuickEstimateValues>) => {
    onChange({ ...values, ...patch });
  };

  const hasValues =
    values.grossSalary > 0 ||
    values.tds > 0 ||
    values.section80C > 0 ||
    values.section80D > 0 ||
    values.businessReceipts > 0;

  return (
    <div className="card-premium space-y-4 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="min-w-0 flex-1 text-sm leading-relaxed text-muted-foreground sm:text-base sm:leading-7">
        <strong className="font-semibold text-slate-900">
          No worries — rough numbers are fine.
        </strong>{" "}
          Enter ballpark figures now. Upload Form 16 or AIS anytime and we&apos;ll
          update your estimate.
        </p>
        {hasValues && (
          <ResetStepButton
            label="Clear form"
            onClick={() => onChange({ ...EMPTY_QUICK_ESTIMATE })}
            variant="ghost"
            className="shrink-0"
          />
        )}
      </div>

      <div>
        <FieldLabel>
          Annual gross salary{showBusiness ? " (leave blank if none)" : ""}
        </FieldLabel>
        <TextInput
          type="text"
          placeholder="e.g. 12,00,000"
          value={formatAmountInput(values.grossSalary)}
          onChange={(v) => update({ grossSalary: parseAmount(v) })}
          onFocus={grossFocus.onFocus}
        />
        {values.grossSalary > 0 && (
          <p className="mt-1 text-xs text-slate-500">{formatINR(values.grossSalary)}</p>
        )}
      </div>

      {showBusiness && (
        <div>
          <FieldLabel>Business / freelance receipts this year</FieldLabel>
          <TextInput
            type="text"
            placeholder="e.g. 18,00,000"
            value={formatAmountInput(values.businessReceipts)}
            onChange={(v) => update({ businessReceipts: parseAmount(v) })}
          />
          <p className="mt-1 text-xs text-slate-500">
            Total money received from clients or customers, before expenses. You
            can fine-tune this on the next screen.
          </p>
        </div>
      )}

      <div>
        <FieldLabel>TDS already deducted (optional)</FieldLabel>
        <TextInput
          type="text"
          placeholder="e.g. 85,000"
          value={formatAmountInput(values.tds)}
          onChange={(v) => update({ tds: parseAmount(v) })}
          onFocus={tdsFocus.onFocus}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel>80C investments (PF, ELSS, etc.)</FieldLabel>
          <TextInput
            type="text"
            placeholder="e.g. 1,50,000"
            value={formatAmountInput(values.section80C)}
            onChange={(v) => update({ section80C: parseAmount(v) })}
            onFocus={c80Focus.onFocus}
          />
        </div>
        <div>
          <FieldLabel>80D health insurance</FieldLabel>
          <TextInput
            type="text"
            placeholder="e.g. 25,000"
            value={formatAmountInput(values.section80D)}
            onChange={(v) => update({ section80D: parseAmount(v) })}
            onFocus={d80Focus.onFocus}
          />
        </div>
      </div>

      <p className="border-t border-slate-200/80 pt-4 text-xs leading-relaxed text-muted-foreground sm:text-sm">
        Estimate mode: figures shown are illustrative and based only on what you enter here. Your
        final tax or refund is determined by the Income Tax Department after you file on
        incometax.gov.in — we do not guarantee any refund.
      </p>
    </div>
  );
}
