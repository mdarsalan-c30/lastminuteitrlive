import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { Users, FileText, Cpu, CheckCircle, Bot, Zap, IndianRupee } from "lucide-react";
import Link from "next/link";

export function B2BHowItWorks() {
  const steps = [
    {
      step: 1,
      title: "Onboard Your Clients",
      detail: "Add clients directly to your secure partner dashboard or send them a white-labeled onboarding link.",
      icon: <Users className="size-6 text-[#0e5f63]" />,
    },
    {
      step: 2,
      title: "Upload & Parse",
      detail: "Drop in Form 16s, AIS, and 26AS PDFs. Our AI extracts and maps all tax data automatically.",
      icon: <FileText className="size-6 text-[#0e5f63]" />,
    },
    {
      step: 3,
      title: "Optimize & Review",
      detail: "The engine instantly compares regimes and flags AIS mismatches. Review the generated plan in seconds.",
      icon: <Cpu className="size-6 text-[#0e5f63]" />,
    },
    {
      step: 4,
      title: "File with Confidence",
      detail: "Export a structured JSON or directly use the copy-ready guide to file on the ITD portal efficiently.",
      icon: <CheckCircle className="size-6 text-[#0e5f63]" />,
    },
  ];

  return (
    <section className="section-pad-lg px-4 sm:px-6 lg:px-8 bg-[#FAFAFB]">
      <div className="mx-auto w-full max-w-[1180px]">
        <ScrollReveal className="text-center mb-16">
          <span className="eyebrow-label">WORKFLOW</span>
          <h2 className="font-manrope mt-3.5 text-[clamp(28px,3vw,42px)] font-bold tracking-[-0.02em] text-[#0B1220] leading-[1.15]">
            How the Partner Program Works
          </h2>
          <p className="mt-4 text-[16px] text-[#6B7280] leading-relaxed max-w-[600px] mx-auto">
            Streamline your practice and process returns 10x faster.
          </p>
        </ScrollReveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <ScrollReveal key={step.step} delay={(i as 0 | 1 | 2 | 3)}>
              <div className="group relative h-full rounded-[16px] border border-[#E6E8EC] bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-20px_rgba(11,18,32,.15)] overflow-hidden">
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#bfe9e0]/40 transition-transform duration-500 group-hover:scale-150" />
                
                <div className="relative mb-6 flex h-14 w-14 items-center justify-center rounded-[12px] bg-[#E8F3F1] shadow-sm">
                  {step.icon}
                </div>

                <div className="relative z-10">
                  <div className="mb-2 flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0e5f63] text-[12px] font-bold text-white">
                      {step.step}
                    </span>
                    <h3 className="font-manrope text-[18px] font-extrabold tracking-[-0.01em] text-[#0B1220]">
                      {step.title}
                    </h3>
                  </div>
                  <p className="mt-3 text-[14.5px] text-[#6B7280] leading-[1.6]">
                    {step.detail}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function B2BTools() {
  const tools = [
    {
      title: "AIS Mismatch Detector",
      desc: "Automatically cross-reference client-provided data against AIS/TIS to flag discrepancies before you file.",
      icon: <Zap className="size-5 text-[#0e5f63]" />,
    },
    {
      title: "WhatsApp Bot Integration",
      desc: "Collect documents and missing details from clients directly through an automated WhatsApp flow.",
      icon: <Bot className="size-5 text-[#0e5f63]" />,
    },
    {
      title: "Bulk Processing",
      desc: "Upload dozens of Form 16s at once. Let the engine calculate the optimal regime for all clients simultaneously.",
      icon: <Cpu className="size-5 text-[#0e5f63]" />,
    }
  ];

  return (
    <section className="section-pad-lg px-4 sm:px-6 lg:px-8 bg-white">
      <div className="mx-auto w-full max-w-[1180px]">
        <ScrollReveal className="text-center mb-16">
          <span className="eyebrow-label">PRO TOOLS</span>
          <h2 className="font-manrope mt-3.5 text-[clamp(28px,3vw,42px)] font-bold tracking-[-0.02em] text-[#0B1220] leading-[1.15]">
            Built specifically for CAs
          </h2>
        </ScrollReveal>
        
        <div className="grid gap-8 md:grid-cols-3">
          {tools.map((tool, i) => (
             <ScrollReveal key={tool.title} delay={(i as 0 | 1 | 2)}>
               <div className="rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition">
                 <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-[#bfe9e0]/30 p-3">
                   {tool.icon}
                 </div>
                 <h3 className="mb-2 font-manrope text-xl font-bold text-foreground">
                   {tool.title}
                 </h3>
                 <p className="text-[15px] text-muted-foreground leading-relaxed">
                   {tool.desc}
                 </p>
               </div>
             </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function B2BPricing() {
  const tiers = [
    {
      name: "Starter Pack",
      filings: 20,
      price: 4999,
      originalPrice: 7180,
      popular: false,
    },
    {
      name: "Growth Pack",
      filings: 40,
      price: 8999,
      originalPrice: 14360,
      popular: true,
    },
    {
      name: "Pro Pack",
      filings: 100,
      price: 16999,
      originalPrice: 35900,
      popular: false,
    }
  ];

  return (
    <section className="section-pad-lg px-4 sm:px-6 lg:px-8 bg-[#FAFAFB]">
      <div className="mx-auto w-full max-w-[1180px]">
        <ScrollReveal className="text-center mb-16">
          <span className="eyebrow-label">PRICING</span>
          <h2 className="font-manrope mt-3.5 text-[clamp(28px,3vw,42px)] font-bold tracking-[-0.02em] text-[#0B1220] leading-[1.15]">
            Simple, pay-as-you-grow pricing
          </h2>
          <p className="mt-4 text-[16px] text-[#6B7280] leading-relaxed max-w-[600px] mx-auto">
            Choose a package that fits your firm&apos;s volume. Purchase filing credits upfront and use them anytime.
          </p>
        </ScrollReveal>

        <div className="grid gap-6 md:grid-cols-3 mx-auto max-w-5xl">
          {tiers.map((tier, i) => (
            <ScrollReveal key={tier.name} delay={(i as 0 | 1 | 2)}>
              <div className={`relative flex flex-col rounded-3xl border p-8 shadow-sm ${tier.popular ? 'border-[#0e5f63]/40 bg-white ring-1 ring-[#0e5f63]/20 shadow-md' : 'border-[#E6E8EC] bg-white'}`}>
                {tier.popular && (
                   <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 rounded-full bg-[#0e5f63] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                     Most Popular
                   </div>
                )}
                <h3 className="font-manrope text-xl font-bold text-foreground">{tier.name}</h3>
                <p className="mt-2 text-[14px] text-muted-foreground">{tier.filings} Filings included</p>
                
                <div className="mt-6 flex flex-wrap items-baseline gap-2 text-[36px] font-extrabold tracking-tight text-[#0B1220]">
                  <span>₹{tier.price}</span>
                  {tier.originalPrice && (
                    <span className="text-xl font-semibold text-muted-foreground line-through">
                      ₹{tier.originalPrice}
                    </span>
                  )}
                </div>
                <div className="text-[13px] text-muted-foreground font-medium mb-6">
                  (₹{Math.round(tier.price / tier.filings)} / filing)
                </div>

                <ul className="space-y-3 text-[14.5px] text-foreground flex-1 mb-8">
                  <li className="flex gap-2.5"><CheckCircle className="size-4.5 text-[#0e5f63] flex-shrink-0 mt-0.5" /> Unlimited client onboarding</li>
                  <li className="flex gap-2.5"><CheckCircle className="size-4.5 text-[#0e5f63] flex-shrink-0 mt-0.5" /> AI Document Parsing</li>
                  <li className="flex gap-2.5"><CheckCircle className="size-4.5 text-[#0e5f63] flex-shrink-0 mt-0.5" /> White-labeled reports</li>
                </ul>
                <button
                  className={tier.popular ? "btn-pill-primary w-full justify-center" : "btn-pill-secondary w-full justify-center"}
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  Apply Now
                </button>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function B2BFAQ() {
  const faqs = [
    {
      q: "Is client data secure?",
      a: "Yes. All client data is encrypted and strictly localized on Indian servers. We adhere to DPDP regulations, and data is deleted upon your request."
    },
    {
      q: "Can I white-label the reports?",
      a: "Absolutely. Partner CAs can upload their firm's logo, which will appear on all client-facing tax optimization reports and dashboards."
    },
    {
      q: "What documents does the AI support?",
      a: "Currently, our engine automatically parses Form 16 (Part A & B), AIS PDFs, and 26AS PDFs. Support for Capital Gains statements is in beta."
    }
  ];

  return (
    <section className="section-pad-lg px-4 sm:px-6 lg:px-8 bg-white">
      <div className="mx-auto w-full max-w-[800px]">
        <ScrollReveal className="text-center mb-12">
          <h2 className="font-manrope text-[clamp(28px,3vw,36px)] font-bold tracking-[-0.02em] text-[#0B1220]">
            Frequently Asked Questions
          </h2>
        </ScrollReveal>
        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <ScrollReveal key={i} delay={0}>
              <div className="rounded-xl border border-border p-6 shadow-sm">
                <h4 className="font-manrope text-lg font-bold text-foreground mb-2">{faq.q}</h4>
                <p className="text-[15px] text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
