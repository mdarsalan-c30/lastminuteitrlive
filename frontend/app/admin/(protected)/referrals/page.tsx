import { all } from "@/lib/db/store";
import { PageHeader } from "../../_components/ui";
import { ReferralManager } from "./ReferralManager";
import { getReferralConfig } from "@/lib/admin/referrals";

export const dynamic = "force-dynamic";

export default async function ReferralsPage() {
  const [config, codes, redemptions] = await Promise.all([
    getReferralConfig(),
    all("referralCodes"),
    all("referralRedemptions"),
  ]);

  return (
    <div>
      <PageHeader
        title="Referrals & Rewards"
        subtitle="Manage referral incentives and view generation stats"
      />
      <ReferralManager config={config} codes={codes} redemptions={redemptions} />
    </div>
  );
}
