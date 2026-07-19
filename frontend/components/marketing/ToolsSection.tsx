"use client";

import Link from "next/link";
import { Calculator, FileText, TrendingUp, ArrowRight, Info } from "lucide-react";

export function ToolsSection() {
  const tools = [
    {
      title: "HRA Exemption Calculator",
      description: "Calculate your exact House Rent Allowance exemption based on salary, rent paid, and city tier.",
      icon: <HomeIcon className="size-6" style={{ color: "#0e5f63" }} />,
      link: "/tools/hra-calculator",
    },
    {
      title: "Old vs New Regime Calculator",
      description: "Compare your tax liability under both regimes to find out which one saves you more money.",
      icon: <Calculator className="size-6" style={{ color: "#0e5f63" }} />,
      link: "/tools/tax-calculator",
    },
    {
      title: "Rent Receipt Generator",
      description: "Instantly generate valid rent receipts to submit to your employer for HRA claims.",
      icon: <FileText className="size-6" style={{ color: "#0e5f63" }} />,
      link: "/tools/rent-receipt",
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Free Tax Tools
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            Use our free calculators and generators to plan your taxes and claim maximum deductions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {tools.map((tool, index) => (
            <Link key={index} href={tool.link} className="block group">
              <div 
                className="h-full rounded-2xl p-8 transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
                style={{ backgroundColor: "#bfe9e0" }}
              >
                {/* Background decorative element */}
                <div 
                  className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500"
                  style={{ backgroundColor: "#0e5f63" }}
                />

                <div>
                  <div 
                    className="inline-flex items-center justify-center rounded-xl p-3 mb-6 bg-white/60 shadow-sm group-hover:bg-white transition-colors duration-300"
                  >
                    {tool.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 flex items-center gap-2" style={{ color: "#0e5f63" }}>
                    {tool.title}
                    <Info className="size-5 opacity-70" />
                  </h3>
                  <p className="text-sm font-medium leading-relaxed opacity-80" style={{ color: "#0e5f63" }}>
                    {tool.description}
                  </p>
                </div>
                
                <div className="mt-8 flex items-center justify-between">
                  <span className="text-sm font-bold uppercase tracking-wider" style={{ color: "#0e5f63" }}>
                    Use Tool
                  </span>
                  <div 
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-white group-hover:-rotate-45 transition-transform duration-300 shadow-sm"
                  >
                    <ArrowRight className="size-5" style={{ color: "#0e5f63" }} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold text-white transition-all hover:opacity-90 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            style={{ backgroundColor: "#0e5f63" }}
          >
            Explore all tools <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function HomeIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
