"use client";

import {
  ITR_FORMS_REFERENCE,
  type ItrSupportLevel,
} from "@/lib/copy/itrForms";
import { cn } from "@/lib/utils";

function supportBadge(level: ItrSupportLevel, label: string) {
  const styles: Record<ItrSupportLevel, string> = {
    guided: "bg-emerald-100 text-emerald-800",
    partner: "bg-blue-100 text-blue-800",
    coming_soon: "bg-slate-100 text-slate-600",
  };
  return (
    <span
      className={cn(
        "inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        styles[level]
      )}
    >
      {label}
    </span>
  );
}

export function ItrFormGuideTable({ compact = false }: { compact?: boolean }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/80">
            <th className="px-3 py-2.5 font-semibold text-slate-700">Form</th>
            <th className="px-3 py-2.5 font-semibold text-slate-700">
              Who should file?
            </th>
            {!compact && (
              <th className="px-3 py-2.5 font-semibold text-slate-700">
                On LastMinute ITR
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {ITR_FORMS_REFERENCE.map((row) => (
            <tr key={row.form} className="align-top hover:bg-slate-50/50">
              <td className="px-3 py-2.5 font-semibold text-slate-900 whitespace-nowrap">
                {row.form}
                {row.nickname ? (
                  <span className="block text-[11px] font-normal text-slate-500">
                    {row.nickname}
                  </span>
                ) : null}
              </td>
              <td className="px-3 py-2.5 text-[13px] text-slate-600 leading-snug">
                {row.whoShouldFile}
              </td>
              {!compact && (
                <td className="px-3 py-2.5">
                  {supportBadge(row.support, row.supportLabel)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
