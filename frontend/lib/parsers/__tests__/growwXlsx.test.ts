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

  it("uses Zerodha Tax P&L summary sheets and keeps F&O separate", () => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet([
        ["Short Term profit", 0],
        ["Long Term profit", 0],
        ["Intraday/Speculative profit", -250],
      ]),
      "Equity and Non Equity"
    );
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet([
        ["Short Term profit Equity", 0],
        ["Long Term profit Equity", 0],
        ["Short Term profit Debt", 0],
        ["Long Term profit Debt", 0],
      ]),
      "Mutual Funds"
    );
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet([
        ["Options Realized Profit", -96258.25],
        ["Futures Realized Profit", 0],
        ["Options Turnover", 314905.25],
        ["Futures Turnover", 0],
      ]),
      "F&O"
    );

    const result = parseGrowwWorkbookBuffer(
      XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })
    );

    expect(result.parseMode).toBe("extracted");
    expect(result.capitalGains.stcg_111a).toBe(0);
    expect(result.businessIncome?.fnoNonSpeculativeProfit).toBe(-96258.25);
    expect(result.businessIncome?.fnoTurnover).toBe(314905.25);
    expect(result.businessIncome?.fnoSpeculativeProfit).toBe(-250);
  });

  it("parses Groww mutual-fund category summaries with currency-formatted values", () => {
    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.aoa_to_sheet([
      ["", "", "Asset Class / Category", "Taxable Short Term", "Taxable Long Term"],
      ["", "", "Equity", "₹1,250.50", "₹2,500.25"],
      ["", "", "Debt (Specified - Other than Equity)", "(₹300.00)", "₹400.00"],
      ["", "", "Debt (Unspecified - Other than Equity)", "₹100.00", "(₹50.00)"],
      [],
      [
        "Scheme Name",
        "Scheme Code",
        "Category",
        "Folio Number",
        "Purchase Transaction Id",
        "Purchase Date",
        "Matched Quantity",
        "Purchase Price",
        "Redeem Transaction Id",
        "Redeem Date",
        "Grandfathered Nav",
        "Redeem Price",
        "Short Term-Capital Gain",
        "Long Term-Capital Gain",
      ],
      [
        "Example Fund",
        "1",
        "Equity",
        "123",
        "1",
        "2025-01-01",
        "1",
        "100",
        "2",
        "2025-04-01",
        "0",
        "120",
        "20",
        "0",
      ],
    ]);
    XLSX.utils.book_append_sheet(workbook, sheet, "Capital gains");

    const result = parseGrowwWorkbookBuffer(
      XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })
    );

    expect(result.parseMode).toBe("extracted");
    expect(result.capitalGains.stcg_111a).toBe(1250.5);
    expect(result.capitalGains.ltcg_112a).toBe(2500.25);
    expect(result.capitalGains.stcl_equity).toBe(200);
    expect(result.capitalGains.ltcg_other).toBe(350);
  });

  it("parses Angel One Summary without summing detailed trade sheets", () => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet([
        ["Financial Year", "2025-2026"],
        ["Total Taxable P&L", -1000],
        ["Taxable Delivery P&L (LTCG) Excluding Buyback", -600],
        ["Taxable Delivery P&L (STCG) Excluding Buyback", 800],
        ["Taxable Delivery P&L (LTCG) for Buyback", 0],
        ["Taxable Delivery P&L (STCG) for Buyback", 50],
        ["Taxable Intraday  P&L (Speculative)", 200],
        ["Taxable Futures P&L (Non Speculative)", -300],
        ["Taxable Options P&L (Non Speculative)", -400],
        ["Future Turnover", 1000],
        ["Options Turnover", 5000],
      ]),
      "Summary"
    );
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet([
        ["Taxable P&L", "Turnover"],
        [999999, 999999],
      ]),
      "Derivatives Trade Details"
    );

    const result = parseGrowwWorkbookBuffer(
      XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })
    );

    expect(result.parseMode).toBe("extracted");
    expect(result.capitalGains.stcg_111a).toBe(850);
    expect(result.capitalGains.ltcl).toBe(600);
    expect(result.businessIncome?.fnoSpeculativeProfit).toBe(200);
    expect(result.businessIncome?.fnoNonSpeculativeProfit).toBe(-700);
    expect(result.businessIncome?.fnoTurnover).toBe(6000);
  });
});
