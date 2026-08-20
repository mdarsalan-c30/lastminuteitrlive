import { prisma } from "@/lib/prisma";
import type { HeroRibbonConfig } from "@/lib/marketing/heroRibbon";

export async function getPublishedHeroRibbon(): Promise<HeroRibbonConfig | null> {
  try {
    const ribbon = await prisma.heroOfferRibbonConfig.findUnique({
      where: { id: "hero-offer-v2" },
      select: {
        enabled: true,
        imageUrl: true,
        linkUrl: true,
        altText: true,
        showOnMobile: true,
      },
    });

    if (!ribbon?.enabled || !ribbon.imageUrl.trim() || !ribbon.altText.trim()) {
      return null;
    }

    return {
      enabled: true,
      imageUrl: ribbon.imageUrl,
      linkUrl: ribbon.linkUrl,
      altText: ribbon.altText,
      showOnMobile: ribbon.showOnMobile,
    };
  } catch {
    return null;
  }
}
