import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  isCamsCapitalGainStatement,
  parseCamsCgText,
} from "../cams";

const sample = readFileSync(
  join(__dirname, "fixtures", "cams-cg-fy2526-sample.txt"),
  "utf8"
);

describe("parseCamsCgText", () => {
  it("detects CAMS capital gain statements", () => {
    expect(isCamsCapitalGainStatement(sample)).toBe(true);
    expect(isCamsCapitalGainStatement("random pdf text")).toBe(false);
  });

  it("extracts equity STCL and LTCL from scheme TOTAL (loss year)", () => {
    const result = parseCamsCgText(sample);

    expect(result.parseMode).toBe("extracted");
    expect(result.kind).toBe("cams_cg");
    expect(result.fields.pan).toBe("ABCDE1234F");
    expect(result.fields.periodFrom).toBe("01-Apr-2025");
    expect(result.fields.periodTo).toBe("31-Mar-2026");
    expect(result.capitalGains.stcl_equity).toBe(5934.21);
    expect(result.capitalGains.ltcl).toBe(3769.31);
    expect(result.capitalGains.stcg_111a).toBeUndefined();
    expect(result.capitalGains.ltcg_112a).toBeUndefined();
    expect(result.fields.equitySaleValue).toBe(77995.24);
  });

  it("fails clearly on non-CAMS text", () => {
    const result = parseCamsCgText("FORM NO. 16\nGross Salary 100000");
    expect(result.parseMode).toBe("failed");
  });
});
