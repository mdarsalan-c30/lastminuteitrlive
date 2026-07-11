import { describe, expect, it } from "vitest";
import { retrieveGenieChunks, bestRetrievalScore } from "@/lib/filing/genieRetrieval";
import { getGenieIndexStats } from "@/lib/filing/genieContentIndex";
import { answerGenieQuestion } from "@/lib/filing/genieAnswer";
import {
  answerFromDocuments,
  buildGenieDocumentSnapshot,
} from "@/lib/filing/genieDocumentContext";

describe("genie knowledge index", () => {
  it("indexes learn articles, help, glossary, and rules", () => {
    const stats = getGenieIndexStats();
    expect(stats.chunks).toBeGreaterThan(100);
    expect(stats.sources.learn).toBeGreaterThan(50);
    expect(stats.sources.rules).toBeGreaterThan(5);
  });
});

describe("genieRetrieval", () => {
  it("finds HRA content for HRA questions", () => {
    const chunks = retrieveGenieChunks("can I claim HRA exemption in old regime");
    expect(bestRetrievalScore(chunks)).toBeGreaterThan(5);
    expect(chunks.some((c) => c.text.toLowerCase().includes("hra") || c.title.toLowerCase().includes("hra"))).toBe(true);
  });

  it("finds capital gains content for 112A questions", () => {
    const chunks = retrieveGenieChunks("schedule 112a long term capital gains equity");
    expect(bestRetrievalScore(chunks)).toBeGreaterThan(5);
  });

  it("boosts active field context", () => {
    const chunks = retrieveGenieChunks("what is this field", { activeField: "section80c" });
    expect(chunks.some((c) => c.id === "field_section80c")).toBe(true);
  });
});

describe("answerGenieQuestion", () => {
  it("answers 80C from local KB without LLM", async () => {
    const answer = await answerGenieQuestion("what is 80c limit");
    expect(answer.source).toBe("local");
    expect(answer.text.toLowerCase()).toContain("1.5");
  });

  it("personalizes with draft context", async () => {
    const answer = await answerGenieQuestion("which regime", {
      recommendedRegime: "old",
      taxSaving: 15000,
      recommendedForm: "ITR-1",
    });
    expect(answer.text.length).toBeGreaterThan(20);
  });
});

describe("genieDocumentContext", () => {
  const sampleDocs = buildGenieDocumentSnapshot({
    connectedConnectors: ["form16"],
    income: {
      grossSalary: 1_200_000,
      tds: 85_000,
      employer: "Acme Pvt Ltd",
      hraReceived: 240_000,
      actualRentPaid: 0,
      fdInterest: 12_000,
    },
    deductions: { section80C: 150_000, section80D: 25_000, npsExtra: 0 },
    lastParseResult: {
      connectorId: "form16",
      mode: "extracted",
      fieldConfidence: { grossSalary: "high" },
      warnings: [],
      demo: false,
      filename: "Form16_Acme.pdf",
    },
  });

  it("answers salary question from Form 16", () => {
    const answer = answerFromDocuments("what is my gross salary", sampleDocs);
    expect(answer).toContain("₹12,00,000");
    expect(answer).toContain("Form 16");
  });

  it("summarizes all uploads", () => {
    const answer = answerFromDocuments("summarize my uploads", sampleDocs);
    expect(answer).toContain("Acme");
    expect(answer).toContain("₹85,000");
  });

  it("prompts upload when no documents", () => {
    const answer = answerFromDocuments("what is my salary", undefined);
    expect(answer).toContain("upload");
  });

  it("includes CAMS capital gains", () => {
    const camsDocs = buildGenieDocumentSnapshot({
      connectedConnectors: ["cams"],
      income: { grossSalary: 0, tds: 0, employer: "", fdInterest: 0 },
      deductions: { section80C: 0, section80D: 0, npsExtra: 0 },
      capitalGains: {
        ltcg_112a: 45_000,
        stcg_111a: 10_000,
        sourceConnectorId: "cams",
      },
    });
    const answer = answerFromDocuments("how much LTCG in my CAMS", camsDocs);
    expect(answer).toContain("₹45,000");
  });
});

describe("answerGenieQuestion with documents", () => {
  it("uses document source for personal salary question", async () => {
    const answer = await answerGenieQuestion("what is my gross salary", {
      documents: buildGenieDocumentSnapshot({
        connectedConnectors: ["form16"],
        income: { grossSalary: 900_000, tds: 50_000, employer: "Test Co", fdInterest: 0 },
        deductions: { section80C: 0, section80D: 0, npsExtra: 0 },
      }),
    });
    expect(answer.source).toBe("documents");
    expect(answer.text).toContain("₹9,00,000");
  });
});
