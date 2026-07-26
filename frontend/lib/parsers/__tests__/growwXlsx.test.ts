import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
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

  it("extracts Zerodha trade-wise realised P&L columns", () => {
    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.aoa_to_sheet([
      ["Symbol", "ISIN", "Trade Type", "Realized P&L"],
      ["INFY", "INE009A01021", "Short Term", 1250],
      ["TCS", "INE467B01029", "Long Term", -400],
    ]);
    XLSX.utils.book_append_sheet(workbook, sheet, "Equity P&L");

    const result = parseGrowwWorkbookBuffer(
      XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })
    );

    expect(result.parseMode).toBe("extracted");
    expect(result.capitalGains.stcg_111a).toBe(1250);
    expect(result.capitalGains.ltcl).toBe(400);
  });

  it("extracts Groww realised P&L with symbol instead of scheme", () => {
    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.aoa_to_sheet([
      ["Trading Symbol", "Holding Period", "Realised P/L"],
      ["HDFCBANK", "180", 800],
      ["RELIANCE", "Long term", 600],
    ]);
    XLSX.utils.book_append_sheet(workbook, sheet, "Stocks P&L");

    const result = parseGrowwWorkbookBuffer(
      XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })
    );

    expect(result.parseMode).toBe("extracted");
    expect(result.capitalGains.stcg_111a).toBe(800);
    expect(result.capitalGains.ltcg_112a).toBe(600);
  });
});
