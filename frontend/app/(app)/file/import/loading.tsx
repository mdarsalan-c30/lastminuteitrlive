import { FilingLayout } from "@/components/filing/FilingLayout";

export default function ImportLoading() {
  return (
    <FilingLayout mirrorText="Preparing your import workspace…">
      <div
        className="animate-pulse space-y-4"
        aria-busy="true"
        aria-label="Loading import"
      >
        <div className="h-8 w-72 max-w-full rounded bg-slate-100" />
        <div className="h-4 w-full max-w-md rounded bg-slate-100" />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="h-32 rounded-xl bg-slate-100" />
          <div className="h-32 rounded-xl bg-slate-100" />
        </div>
      </div>
    </FilingLayout>
  );
}
