import Link from "next/link";
import { COMPANION_QUICKSTART_ONELINER } from "@/lib/copy/companion";
import { IMPORT_STRIP, SCALE_PROOF } from "@/lib/copy/competitorInspired";
import { QUICK_START_CONNECTORS } from "@/lib/constants";
import { ArrowUpRight, FileText, Landmark, TrendingUp, Wallet } from "lucide-react";

const ICONS: Record<string, React.ElementType> = {
  form16: FileText,
  ais: Landmark,
  groww: TrendingUp,
  mfcentral: Wallet,
};

const CONNECTOR_STATUS_LABEL: Record<
  (typeof IMPORT_STRIP.connectors)[number]["status"],
  { label: string; className: string }
> = {
  live: { label: "Live", className: "bg-emerald-500/15 text-emerald-300" },
  soon: { label: "Soon", className: "bg-amber-500/15 text-amber-300" },
  roadmap: { label: "Roadmap", className: "bg-white/10 text-zinc-400" },
};

function ImportStrip() {
  return (
    <ul className="mt-6 flex flex-wrap gap-2" aria-label="Supported document imports">
      {IMPORT_STRIP.connectors.map((connector) => {
        const status = CONNECTOR_STATUS_LABEL[connector.status];
        return (
          <li
            key={connector.id}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300"
          >
            <span className="font-medium text-white">{connector.label}</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.className}`}>
              {status.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function QuickStart() {
  return (
    <section className="section-dark py-9 md:py-10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
              {IMPORT_STRIP.eyebrow}
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
              {IMPORT_STRIP.headline}
            </h2>
            <p className="mt-3 max-w-lg text-base leading-relaxed text-zinc-400">
              {IMPORT_STRIP.subhead}
            </p>
            <ImportStrip />
            <p className="mt-3 max-w-lg text-xs leading-relaxed text-zinc-500">
              {COMPANION_QUICKSTART_ONELINER}
            </p>
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white">{SCALE_PROOF.headline}</p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                {SCALE_PROOF.detail}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {QUICK_START_CONNECTORS.map((connector) => {
              const Icon = ICONS[connector.id] ?? FileText;
              return (
                <Link
                  key={connector.id}
                  href={connector.href}
                  className="group card-premium-dark flex flex-col p-4 transition-all hover:border-blue-500/30 hover:bg-white/[0.06]"
                >
                  <div className="mb-3 flex size-10 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400 transition-colors group-hover:bg-blue-600/30">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="font-semibold text-white">{connector.title}</h3>
                  <p className="mt-1.5 flex-1 text-xs leading-relaxed text-zinc-400">
                    {connector.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-blue-400 opacity-0 transition-opacity group-hover:opacity-100">
                    Connect
                    <ArrowUpRight className="size-3.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
