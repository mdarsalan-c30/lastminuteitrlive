"use client";

import { useRouter } from "next/navigation";
import { useDraftStore } from "@/lib/store/draft";
import { FilingLayout } from "@/components/filing/FilingLayout";
import { Button, Banner, FilingActions, ScreenTitle } from "@/components/filing/ui";
import { PLANS } from "@/lib/payments/plans";
import { CA_REVIEW_COMING_SOON, NO_CA_REPLACEMENT } from "@/lib/copy/trust";

export default function CabrainPage() {
  const router = useRouter();
  const { plan, setPlan } = useDraftStore();
  const caPlan = PLANS.ca;
  const hasCaPlan = plan === "ca";

  const reviewHref = "/file/review/risk#final-check";

  return (
    <FilingLayout
      mirrorText="Profession-specific deductions (doctors, IT with RSUs, pensioners) may need a tax professional. CA Review is launching soon — you still file on incometax.gov.in yourself."
    >
      <ScreenTitle
        title="Extra tax-saving check"
        subtitle="Optional CA review for complex profession-specific deductions — launching soon on the CA Review plan."
      />

      <Banner variant="info">
        <strong>Coming soon — CA Review plan.</strong> {CA_REVIEW_COMING_SOON}{" "}
        When live, a qualified professional may review profession-specific savings
        (doctors, IT with RSUs, pensioners) before you file on the government portal.
      </Banner>

      <p className="mb-4 text-tier-feature text-muted-foreground">{NO_CA_REPLACEMENT}</p>

      {hasCaPlan ? (
        <p className="mb-4 text-sm text-slate-600">
          Included in your {caPlan.name} plan ({caPlan.priceLabel}). We will
          notify you when profession-specific checks are ready.
        </p>
      ) : (
        <>
          <p className="mb-4 text-sm text-slate-600">
            Upgrade to {caPlan.name} ({caPlan.priceLabel}) for optional professional
            review and notice-risk checks when this feature launches.
          </p>
          <ul className="mb-6 space-y-2 text-sm text-slate-700">
            {caPlan.features.map((feature) => (
              <li key={feature}>✓ {feature}</li>
            ))}
          </ul>
        </>
      )}

      <FilingActions>
        <Button onClick={() => router.push(reviewHref)}>Continue to review</Button>
        {!hasCaPlan && (
          <Button
            variant="ghost"
            onClick={() => {
              setPlan("ca");
              router.push("/file/checkout/plans");
            }}
          >
            View CA Review plan
          </Button>
        )}
      </FilingActions>
    </FilingLayout>
  );
}
