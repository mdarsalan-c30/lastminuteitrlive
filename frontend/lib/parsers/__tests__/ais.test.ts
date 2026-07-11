import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseAisOrTisText } from "../ais";
import { looksLikeEncryptedItdBlob } from "../pdfText";

const aisText = readFileSync(
  join(__dirname, "fixtures", "ais-fy2526-sample.txt"),
  "utf8"
);
const tisText = readFileSync(
  join(__dirname, "fixtures", "tis-fy2526-sample.txt"),
  "utf8"
);

describe("parseAisOrTisText", () => {
  it("parses FY AIS salary, TDS, SB interest, and dividend (Indian commas)", () => {
    const result = parseAisOrTisText(aisText);

    expect(result.parseMode).toBe("extracted");
    expect(result.kind).toBe("ais");
    expect(result.fields.grossSalary).toBe(1_771_368);
    expect(result.fields.tdsSalary).toBe(144_845);
    expect(result.fields.savingsInterest).toBeGreaterThanOrEqual(1_090);
    expect(result.fields.dividendIncome).toBe(151);
    expect(result.fields.pan).toBe("ABCDE1234F");
  });

  it("parses TIS category summary including sale-of-securities turnover warning", () => {
    const result = parseAisOrTisText(tisText);

    expect(result.parseMode).toBe("extracted");
    expect(result.kind).toBe("tis");
    expect(result.fields.grossSalary).toBe(1_771_368);
    expect(result.fields.dividendIncome).toBe(151);
    expect(result.fields.savingsInterest).toBe(1_396);
    expect(result.fields.saleOfSecurities).toBe(143_119);
    expect(
      result.warnings.some((w) => w.toLowerCase().includes("turnover"))
    ).toBe(true);
  });

  it("fails clearly on empty / locked-looking text", () => {
    const result = parseAisOrTisText("short");
    expect(result.parseMode).toBe("failed");
  });
});

describe("looksLikeEncryptedItdBlob", () => {
  it("detects Compliance Portal encrypted JSON exports", () => {
    const hexPrefix = Buffer.from(
      "9147b1491d8e9650dc3296606af39ab6b861f1ce" + "\0binaryjunk",
      "latin1"
    );
    expect(looksLikeEncryptedItdBlob(hexPrefix)).toBe(true);
  });

  it("allows real JSON", () => {
    expect(looksLikeEncryptedItdBlob(Buffer.from('{"ais":true}'))).toBe(false);
  });
});
