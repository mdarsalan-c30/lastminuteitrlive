import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CA_SESSION_COOKIE, readCASession } from "@/lib/auth/ca";
import { all } from "@/lib/db/store";
import { PLANS } from "@/lib/payments/plans";
import { CheckCircle2, ShieldCheck } from "lucide-react";

// PAYMENT_API_TODO: wire "Buy Now" to the Razorpay B2B order flow once keys
// are live. Until then, purchases route through the partnerships inbox.
const BUY_MAILTO = (pack: string) =>
  `mailto:partners@lastminuteitr.com?subject=${encodeURIComponent(
    `Buy credits: ${pack}`
  )}`;

const PACKS = [
  {
    planId: "b2b_20" as const,
    title: "20 Applications",
    perFiling: "₹250 / filing",
    popular: false,
    features: [
      "Assign up to 20 clients",
      "Credit wallet & analytics",
      "Robust CRM dashboard tracking",
    ],
  },
  {
    planId: "b2b_40" as const,
    title: "40 Applications",
    perFiling: "₹225 / filing",
    popular: true,
    features: [
      "Assign up to 40 clients",
      "Credit wallet & analytics",
      "Robust CRM dashboard tracking",
      "Priority error rollback",
    ],
  },
  {
    planId: "b2b_100" as const,
    title: "100 Applications",
    perFiling: "₹170 / filing",
    popular: false,
    features: [
      "Assign up to 100 clients",
      "Credit wallet & analytics",
      "Robust CRM dashboard tracking",
    ],
  },
];

function inr(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

export default async function CABillingPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(CA_SESSION_COOKIE)?.value;
  const session = readCASession(token);

  if (!session) {
    redirect("/auth/ca-login");
  }

  const tenants = await all("tenants");
  const tenant = tenants.find((t) => t.id === session.tenantId);
  const credits = tenant?.creditsAvailable || 0;

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Billing & Packages</h2>
        <p className="text-sm text-slate-500 mt-1">
          Purchase application credits in bulk. You currently have <span className="font-bold text-slate-800">{credits} credits</span> available.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PACKS.map((pack) => {
          const plan = PLANS[pack.planId];
          return (
            <div
              key={pack.planId}
              className={
                pack.popular
                  ? "bg-white rounded-2xl border-2 border-blue-500 shadow-md relative flex flex-col overflow-hidden transform md:-translate-y-2"
                  : "bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all flex flex-col overflow-hidden"
              }
            >
              {pack.popular && (
                <>
                  <div className="absolute top-0 inset-x-0 h-1 bg-blue-500" />
                  <div className="absolute top-4 right-4 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                    Most Popular
                  </div>
                </>
              )}
              <div className="p-6 flex-1">
                <h3 className="font-bold text-xl text-slate-900">{pack.title}</h3>
                <p className="text-xs text-slate-500 mb-6">Valid for 1 year</p>

                <div className="flex items-end gap-2 mb-6">
                  <span className="text-3xl font-black tabular-nums tracking-tight">
                    {inr(plan.price)}
                  </span>
                  {plan.originalPrice && plan.originalPrice > plan.price && (
                    <span className="text-sm text-slate-400 line-through mb-1.5">
                      {inr(plan.originalPrice)}
                    </span>
                  )}
                </div>

                <ul className="space-y-3 text-sm text-slate-600">
                  {pack.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckCircle2 className="size-4 text-blue-500 mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div
                className={
                  pack.popular
                    ? "p-6 bg-blue-50 border-t border-blue-100 flex items-center justify-between"
                    : "p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between"
                }
              >
                <span className="text-sm font-semibold text-blue-600">{pack.perFiling}</span>
                <a
                  href={BUY_MAILTO(pack.title)}
                  className={
                    pack.popular
                      ? "px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
                      : "px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition"
                  }
                >
                  Buy Now
                </a>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 flex items-start gap-3">
        <ShieldCheck className="size-5 text-emerald-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-slate-800">
            How buying works right now
          </p>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Online checkout for credit packs is being wired up. Until then, click
            Buy Now to email our partnerships team — credits are added to your
            wallet the same working day, and a GST invoice is issued with every
            purchase.
          </p>
        </div>
      </div>
    </div>
  );
}
