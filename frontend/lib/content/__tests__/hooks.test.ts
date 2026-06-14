import { describe, expect, it } from "vitest";
import { suggestItrType } from "@/lib/content/hooks";

describe("suggestItrType", () => {
  const base = {
    income: "salary_only",
    employers: "one",
    property: "none",
    income_level: "no",
    residency: "resident",
  } as const;

  it("suggests ITR-1 for simple salaried resident", () => {
    expect(suggestItrType(base)).toBe("itr1");
  });

  it("suggests ITR-2 for capital gains", () => {
    expect(
      suggestItrType({ ...base, income: "capital_gains" })
    ).toBe("itr2");
  });

  it("escalates for business income", () => {
    expect(
      suggestItrType({ ...base, income: "business" })
    ).toBe("talkToCa");
  });

  it("escalates for foreign income", () => {
    expect(
      suggestItrType({ ...base, income: "foreign" })
    ).toBe("talkToCa");
  });

  it("escalates for income above 50L", () => {
    expect(
      suggestItrType({ ...base, income_level: "yes" })
    ).toBe("talkToCa");
  });
});
