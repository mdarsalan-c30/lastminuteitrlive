import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  detectForm16PartKind,
  form16ExtractorsForTests,
  mergeForm16FileResultsForTests,
  parseForm16MultiPart,
  parseForm16Text,
  scrubPanFromLogMessage,
  type Form16FileParseResult,
} from "../form16";

const sampleText = readFileSync(
  join(__dirname, "fixtures", "form16-sample.txt"),
  "utf8"
);

const EY_PART_A_SNIPPET = `
Name and address of the Employer/Specified Bank
INTERNATIONAL KNOWLEDGE ACADEMY PRIVATE LIMITED
77, I FLOOR SUITE 1061, 27TH MAIN 13TH CROSS,
Summary of amount paid/credited and tax deducted at source thereon in respect of the employee
Total (Rs.) 11165.00 11165.00	205334.00
I hereby certify that a sum of Rs. 11165.00 [Rs. Eleven Thousand One Hundred and Sixty Five Only (in words)] has been deducted
`;

const EY_PART_B_SNIPPET = `
Annexure - I
Rs. Rs.	1. Gross Salary
Salary as per provisions contained in section 17(1)	(a) 205334.00
(d) Total 205334.00
3. Total amount of salary received from current employer
205334.00
Deduction in respect of life insurance premia, contributions to
provident fund etc. under section 80C
4800.00
Aggregate of deductible amount under Chapter VI-A
4800.00
`;

describe("parseForm16Text", () => {
  it("extracts P0 fields from TRACES-style Part A/B text", () => {
    const result = parseForm16Text(sampleText);

    expect(result.parseMode).toBe("extracted");
    expect(result.fields.employer).toBe("TECHCORP INDIA PRIVATE LIMITED");
    expect(result.fields.grossSalary).toBe(1_200_000);
    expect(result.fields.tds).toBe(85_000);
    expect(result.fields.section80C).toBe(150_000);
    expect(result.confidence.grossSalary).toBe("high");
    expect(result.confidence.tds).toBe("high");
    expect(result.confidence.employer).toBe("high");
    expect(result.confidence.section80C).toBe("high");
  });

  it("returns demo_fallback when core salary fields are missing", () => {
    const result = parseForm16Text("FORM NO. 16\nSome unreadable content only.");

    expect(result.parseMode).toBe("demo_fallback");
    expect(result.confidence.grossSalary).toBe("missing");
    expect(result.confidence.tds).toBe("missing");
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("returns partial extracted result for Part A-only text", () => {
    const partAText = `
      PART A
      Name and address of the Employer/Deductor
      EXAMPLE EMPLOYER LTD
      Total amount of tax deducted/collected (Rs.)
      42,500.00
    `;
    const result = parseForm16Text(partAText, "part_a");

    expect(result.parseMode).toBe("extracted");
    expect(result.fields.employer).toBe("EXAMPLE EMPLOYER LTD");
    expect(result.fields.tds).toBe(42_500);
    expect(result.warnings.some((w) => w.includes("Part B"))).toBe(true);
  });

  it("does not expose PAN in scrubbed log messages", () => {
    const scrubbed = scrubPanFromLogMessage(
      "Failed for PAN ABCDE1234F in employer block"
    );
    expect(scrubbed).not.toContain("ABCDE1234F");
    expect(scrubbed).toContain("*****PAN*****");
  });
});

describe("EY/TRACES extractors", () => {
  const { extractEmployerName, extractGrossSalary, extractTds, extractSection80C } =
    form16ExtractorsForTests;

  it("extracts employer from Employer/Specified Bank label", () => {
    expect(extractEmployerName(EY_PART_A_SNIPPET)).toBe(
      "INTERNATIONAL KNOWLEDGE ACADEMY PRIVATE LIMITED"
    );
  });

  it("extracts TDS from EY Part A summary and certification", () => {
    expect(extractTds(EY_PART_A_SNIPPET)).toBe(11_165);
  });

  it("extracts gross salary from section 17(1) without matching row number 17", () => {
    expect(extractGrossSalary(EY_PART_B_SNIPPET)).toBe(205_334);
  });

  it("extracts section 80C from Part B Chapter VI-A table", () => {
    expect(extractSection80C(EY_PART_B_SNIPPET)).toBe(4_800);
  });

  it("parses EY Part A snippet end-to-end", () => {
    const result = parseForm16Text(EY_PART_A_SNIPPET, "part_a");
    expect(result.parseMode).toBe("extracted");
    expect(result.fields.employer).toBe("INTERNATIONAL KNOWLEDGE ACADEMY PRIVATE LIMITED");
    expect(result.fields.tds).toBe(11_165);
    expect(result.fields.grossSalary).toBeUndefined();
  });

  it("parses EY Part B snippet end-to-end", () => {
    const result = parseForm16Text(EY_PART_B_SNIPPET, "part_b");
    expect(result.parseMode).toBe("extracted");
    expect(result.fields.grossSalary).toBe(205_334);
    expect(result.fields.section80C).toBe(4_800);
    expect(result.fields.tds).toBeUndefined();
  });
});

describe("detectForm16PartKind", () => {
  it("detects part kinds from common employer filenames", () => {
    expect(detectForm16PartKind("BS50095_PartA (1).pdf")).toBe("part_a");
    expect(detectForm16PartKind("BS50095_PartB (1).pdf")).toBe("part_b");
    expect(detectForm16PartKind("BS50095_12BA_Anex.pdf")).toBe("annexure");
  });
});

describe("mergeForm16FileResultsForTests", () => {
  it("merges Part A TDS with Part B salary fields", () => {
    const partA = parseForm16Text(
      `
      PART A
      Name and address of the Employer/Deductor
      MERGED EMPLOYER PVT LTD
      Total amount of tax deducted/collected (Rs.)
      90,000.00
    `,
      "part_a"
    );
    const partB = parseForm16Text(
      `
      PART B
      Gross Salary
      1,500,000.00
      Aggregate amount deductible under section 80C
      120,000.00
    `,
      "part_b"
    );

    const fileResults: Form16FileParseResult[] = [
      {
        name: "employer_PartA.pdf",
        partKind: "part_a",
        textLength: 200,
        fields: partA.fields,
        confidence: partA.confidence,
        parseMode: partA.parseMode,
        warnings: partA.warnings,
      },
      {
        name: "employer_PartB.pdf",
        partKind: "part_b",
        textLength: 200,
        fields: partB.fields,
        confidence: partB.confidence,
        parseMode: partB.parseMode,
        warnings: partB.warnings,
      },
    ];

    const result = mergeForm16FileResultsForTests(fileResults);

    expect(result.parseMode).toBe("extracted");
    expect(result.fields.employer).toBe("MERGED EMPLOYER PVT LTD");
    expect(result.fields.tds).toBe(90_000);
    expect(result.fields.grossSalary).toBe(1_500_000);
    expect(result.fields.section80C).toBe(120_000);
  });

  it("does not merge demo_fallback placeholder values into merged output", () => {
    const demoPart = parseForm16Text("FORM NO. 16\nUnreadable content.");
    const partB = parseForm16Text(
      `
      PART B
      Salary as per provisions contained in section 17(1) (a) 250000.00
      (d) Total 250000.00
    `,
      "part_b"
    );

    const result = mergeForm16FileResultsForTests([
      {
        name: "bad_part_a.pdf",
        partKind: "part_a",
        textLength: 50,
        fields: demoPart.fields,
        confidence: demoPart.confidence,
        parseMode: demoPart.parseMode,
        warnings: demoPart.warnings,
      },
      {
        name: "part_b.pdf",
        partKind: "part_b",
        textLength: 200,
        fields: partB.fields,
        confidence: partB.confidence,
        parseMode: partB.parseMode,
        warnings: partB.warnings,
      },
    ]);

    expect(result.fields.employer).toBeUndefined();
    expect(result.fields.tds).toBeUndefined();
    expect(result.fields.grossSalary).toBe(250_000);
    expect(result.parseMode).toBe("demo_fallback");
    expect(result.fields.employer).not.toBe("Acme Pvt Ltd");
  });

  it("includes password errors in merged warnings without values", () => {
    const result = mergeForm16FileResultsForTests([
      {
        name: "locked.pdf",
        partKind: "unknown",
        textLength: 0,
        fields: {},
        confidence: {},
        parseMode: "demo_fallback",
        warnings: [],
        error: "Could not open PDF — check password (usually PAN in capitals)",
      },
    ]);

    expect(result.parseMode).toBe("demo_fallback");
    expect(result.warnings.join(" ")).toContain("check password");
    expect(result.warnings.join(" ")).not.toMatch(/[A-Z]{5}[0-9]{4}[A-Z]/);
  });
});

const integrationPassword = process.env.FORM16_TEST_PASSWORD;

describe.skipIf(!integrationPassword)("Form 16 sample PDF integration", () => {
  it("parses BS50095 multi-part PDFs when FORM16_TEST_PASSWORD is set", async () => {
    const samplePaths = [
      "/Users/nikhilanand/Downloads/BS50095_PartA (1).pdf",
      "/Users/nikhilanand/Downloads/BS50095_PartB (1).pdf",
      "/Users/nikhilanand/Downloads/BS50095_12BA_Anex.pdf",
    ];

    const buffers = samplePaths.map((path) => ({
      name: path.split("/").pop() ?? path,
      buffer: readFileSync(path),
    }));

    const result = await parseForm16MultiPart(buffers, integrationPassword);

    expect(result.files.every((f) => !f.error)).toBe(true);
    expect(result.fields.grossSalary).toBeGreaterThan(100_000);
    expect(result.fields.tds).toBeGreaterThan(1_000);
    expect(result.confidence.tds === "high" || (result.fields.tds ?? 0) > 1_000).toBe(
      true
    );
    expect(result.fields.employer).not.toBe("Acme Pvt Ltd");
    expect(result.parseMode).toBe("extracted");
  });
});
