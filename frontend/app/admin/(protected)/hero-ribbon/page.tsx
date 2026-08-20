import { prisma } from "@/lib/prisma";
import { Card, PageHeader } from "../../_components/ui";
import { HeroRibbonEditor, type HeroRibbonForm } from "./HeroRibbonEditor";

export const dynamic = "force-dynamic";

const emptyRibbon: HeroRibbonForm = {
  enabled: false,
  imageUrl: "",
  linkUrl: "",
  altText: "",
  showOnMobile: false,
};

export default async function HeroRibbonPage() {
  const stored = await prisma.heroOfferRibbonConfig
    .findUnique({ where: { id: "hero-offer-v2" } })
    .catch(() => null);

  const initial: HeroRibbonForm = stored
    ? {
        enabled: stored.enabled,
        imageUrl: stored.imageUrl,
        linkUrl: stored.linkUrl ?? "",
        altText: stored.altText,
        showOnMobile: stored.showOnMobile,
      }
    : emptyRibbon;

  return (
    <div>
      <PageHeader
        title="Hero offer ribbon"
        subtitle="Publish an optional promotional ribbon on the Individual Filer hero"
      />
      <Card>
        <HeroRibbonEditor initial={initial} />
      </Card>
    </div>
  );
}
