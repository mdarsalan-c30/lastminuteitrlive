export interface HeroRibbonConfig {
  enabled: true;
  imageUrl: string;
  linkUrl: string | null;
  altText: string;
  showOnMobile: boolean;
}

export function shouldShowHeroRibbon(
  mode: "b2c" | "b2b",
  ribbon: HeroRibbonConfig | null
): ribbon is HeroRibbonConfig {
  return mode === "b2c" && ribbon?.enabled === true;
}
