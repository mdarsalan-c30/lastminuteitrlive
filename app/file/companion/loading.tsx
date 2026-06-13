import { FilingLayout } from "@/components/filing/FilingLayout";

export default function CompanionLoading() {
  return (
    <FilingLayout mirrorText="Loading your portal guide…">
      <div
        className="animate-pulse space-y-4"
        aria-busy="true"
        aria-label="Loading companion"
      >
        <div className="h-8 w-64 max-w-full rounded bg-slate-100" />
        <div className="h-4 w-full max-w-lg rounded bg-slate-100" />
        <div className="h-24 rounded-xl bg-slate-100" />
        <div className="h-48 rounded-xl bg-slate-100" />
      </div>
    </FilingLayout>
  );
}
