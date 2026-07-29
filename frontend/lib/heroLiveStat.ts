export const HERO_LIVE_STAT_ID = "hero-live-stat";
export const HERO_LIVE_STAT_FALLBACK = {
  baseValue: 6578,
  incrementBy: 200,
  intervalHours: 4,
  baseAt: new Date(),
};

export function calculateHeroLiveStat(
  config: {
    baseValue: number;
    incrementBy: number;
    intervalHours: number;
    baseAt: Date;
  },
  now = new Date()
): number {
  const intervalMs = Math.max(1, config.intervalHours) * 60 * 60 * 1000;
  const elapsed = Math.max(0, now.getTime() - config.baseAt.getTime());
  return config.baseValue + Math.floor(elapsed / intervalMs) * config.incrementBy;
}
