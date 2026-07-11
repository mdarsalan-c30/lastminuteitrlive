import { afterEach, describe, expect, it, vi } from "vitest";

const store = {
  pricingConfig: [] as Array<Record<string, unknown>>,
};

vi.mock("@/lib/db/store", () => ({
  resetCache: () => {
    store.pricingConfig = [];
  },
  genId: (prefix: string) => `${prefix}_test`,
  all: async (collection: string) => {
    if (collection === "pricingConfig") return [...store.pricingConfig];
    return [];
  },
  insert: async (_collection: string, row: Record<string, unknown>) => {
    store.pricingConfig.push(row);
    return row;
  },
  update: async (_collection: string, id: string, patch: Record<string, unknown>) => {
    const idx = store.pricingConfig.findIndex((r) => r.id === id);
    if (idx < 0) throw new Error("not found");
    store.pricingConfig[idx] = { ...store.pricingConfig[idx], ...patch };
    return store.pricingConfig[idx];
  },
}));

import { getPublishedPrice, upsertPricingRow } from "@/lib/pricing/config";

describe("pricing config propagation", () => {
  afterEach(() => {
    store.pricingConfig = [];
  });

  it("getPublishedPrice reflects a published base price override", async () => {
    await upsertPricingRow({
      planId: "diy",
      basePriceInr: 1234,
      offerPriceInr: null,
    });
    expect(await getPublishedPrice("diy")).toBe(1234);
  });

  it("an active offer price wins over the base price", async () => {
    const future = new Date(Date.now() + 86_400_000).toISOString();
    await upsertPricingRow({
      planId: "ai_smart",
      basePriceInr: 1999,
      offerPriceInr: 999,
      offerEndsAt: future,
    });
    expect(await getPublishedPrice("ai_smart")).toBe(999);
  });

  it("an expired offer falls back to the base price", async () => {
    const past = new Date(Date.now() - 86_400_000).toISOString();
    await upsertPricingRow({
      planId: "ca",
      basePriceInr: 2999,
      offerPriceInr: 1499,
      offerEndsAt: past,
    });
    expect(await getPublishedPrice("ca")).toBe(2999);
  });
});
