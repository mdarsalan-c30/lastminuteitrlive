import { BriefcaseBusiness, Building2, ChartNoAxesCombined, FileSearch } from "lucide-react";

const SITUATIONS = [
  {
    title: "One or more employers",
    detail: "Bring salary details together and review Form 16 information before filing.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Interest or other income",
    detail: "Check income reported outside Form 16 so important details are not missed.",
    icon: Building2,
  },
  {
    title: "Capital gains",
    detail: "Organise investment information and identify the schedules that may apply.",
    icon: ChartNoAxesCombined,
  },
  {
    title: "AIS or Form 26AS checks",
    detail: "Compare available records and resolve differences before portal submission.",
    icon: FileSearch,
  },
] as const;

export function CommonSituations() {
  return (
    <section id="situations" className="section-pad-lg bg-[#f8fafc]/60 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-9">
          <span className="eyebrow-label rounded-full bg-[#0e5f63]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0e5f63]">
            Common situations
          </span>
          <h2 className="font-manrope mt-3 text-[clamp(24px,3vw,32px)] font-extrabold tracking-[-0.02em] text-slate-900">
            Guidance that adapts to your filing details
          </h2>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-slate-600">
            Your questions and checks depend on the income sources and documents you provide.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SITUATIONS.map(({ title, detail, icon: Icon }) => (
            <article key={title} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-[#0e5f63]/10 text-[#0e5f63]">
                <Icon className="size-5" aria-hidden />
              </div>
              <h3 className="text-[15px] font-bold text-slate-900">{title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{detail}</p>
            </article>
          ))}
        </div>

        <p className="mt-6 text-[12.5px] text-slate-500">
          Guidance is based on the information you enter. Review all values before submitting on
          the Income Tax Department portal.
        </p>
      </div>
    </section>
  );
}
