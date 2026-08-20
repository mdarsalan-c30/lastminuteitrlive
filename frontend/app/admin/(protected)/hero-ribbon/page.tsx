import { prisma } from "@/lib/prisma";
import { Card, PageHeader } from "../../_components/ui";
import {
  HeroRibbonEditor,
  type HeroRibbonForm,
} from "./HeroRibbonEditor";

export const dynamic = "force-dynamic";

const fallback: HeroRibbonForm = {
  enabled: true,
  imageUrl: "/coupon-narnia.png",
  linkUrl: "",
  altText: "₹349 offer — use code NARNIA for 10% discount",
  showOnMobile: false,
};

export default async function HeroRibbonPage() {
  const stored = await prisma.heroRibbonConfig
    .findUnique({ where: { id: "hero-offer" } })
    .catch(() => null);
  const initial: HeroRibbonForm = stored
    ? {
        enabled: stored.enabled,
        imageUrl: stored.imageUrl,
        linkUrl: stored.linkUrl ?? "",
        altText: stored.altText,
        showOnMobile: stored.showOnMobile,
      }
    : fallback;

  return (
    <div>
      <PageHeader
        title="Hero offer ribbon"
        subtitle="Upload, preview and publish the promotional ribbon shown on the Individual Filer hero"
      />
      <Card>
        <HeroRibbonEditor initial={initial} />
      </Card>
    </div>
  );
}
