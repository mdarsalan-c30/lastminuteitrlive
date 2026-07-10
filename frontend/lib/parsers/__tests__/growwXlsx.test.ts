import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  isSpreadsheetFile,
  parseGrowwWorkbookBuffer,
} from "../growwXlsx";

const holdingsBuf = readFileSync(
  join(__dirname, "fixtures", "groww-mf-holdings-empty.xlsx")
);
const cgBuf = readFileSync(
  join(__dirname, "fixtures", "groww-mf-capital-gains-sample.xlsx")
);

describe("parseGrowwWorkbookBuffer", () => {
  it("detects holdings export and refuses to invent capital gains", () => {
    const result = parseGrowwWorkbookBuffer(holdingsBuf);

    expect(result.kind).toBe("holdings");
    expect(result.parseMode).toBe("wrong_document");
    expect(result.capitalGains).toEqual({});
    expect(result.fields.pan).toBe("ABCDE1234F");
    expect(result.guidance?.some((g) => /Capital Gains/i.test(g))).toBe(true);
    expect(
      result.warnings.some((w) => /unrealised|not capital gains/i.test(w))
    ).toBe(true);
  });

  it("extracts equity/debt STCG and LTCG losses from CG Excel", () => {
    const result = parseGrowwWorkbookBuffer(cgBuf);

    expect(result.parseMode).toBe("extracted");
    expect(result.kind).toBe("capital_gains");
    expect(result.capitalGains.stcg_111a).toBe(1200.5);
    expect(result.capitalGains.stcg_other).toBe(500);
    expect(result.capitalGains.ltcl).toBe(3769.31);
    expect(result.capitalGains.ltcg_112a).toBeUndefined();
  });

  it("recognises spreadsheet extensions", () => {
    expect(
      isSpreadsheetFile(
        "Mutual_Funds.xlsx",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      )
    ).toBe(true);
    expect(isSpreadsheetFile("report.pdf", "application/pdf")).toBe(false);
  });
});
