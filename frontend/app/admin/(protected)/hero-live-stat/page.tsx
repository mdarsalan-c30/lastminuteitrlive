import { calculateHeroLiveStat, HERO_LIVE_STAT_ID } from "@/lib/heroLiveStat";
import { prisma } from "@/lib/prisma";
import { Card, PageHeader } from "../../_components/ui";
import { HeroLiveStatEditor } from "./HeroLiveStatEditor";

export const dynamic = "force-dynamic";

export default async function HeroLiveStatPage() {
  const stored = await prisma.heroLiveStatConfig
    .findUnique({ where: { id: HERO_LIVE_STAT_ID } })
    .catch(() => null);
  const currentValue = stored ? calculateHeroLiveStat(stored) : 6578;

  return (
    <div>
      <PageHeader
        title="Hero live stat"
        subtitle="Control the live counter displayed inside the homepage tax comparison card"
      />
      <Card>
        <HeroLiveStatEditor initialValue={currentValue} />
      </Card>
    </div>
  );
}
