/**
 * Document-aware Genie context — answers from Form 16, CAMS, AIS, broker P&L uploads.
 */

export interface GenieEmployerRow {
  name: string;
  grossSalary: number;
  tds: number;
}

export interface GenieDocumentSnapshot {
  connectedConnectors: string[];
  lastParse?: {
    connectorId: string;
    connectorLabel: string;
    filename?: string;
    filenames?: string[];
    mode: string;
    demo: boolean;
    warnings: string[];
    fieldConfidence: Record<string, string>;
    parsedAt?: string;
  };
  form16?: {
    employer?: string;
    grossSalary?: number;
    tds?: number;
    hraReceived?: number;
    actualRentPaid?: number;
    section80C?: number;
    section80D?: number;
    npsExtra?: number;
    employers?: GenieEmployerRow[];
  };
  ais?: {
    grossSalary?: number;
    tds?: number;
    fdInterest?: number;
  };
  capitalGains?: {
    stcg_111a?: number;
    ltcg_112a?: number;
    stcg_other?: number;
    ltcg_other?: number;
    stcl_equity?: number;
    ltcl?: number;
    sourceConnectorId?: string;
  };
  documentFacts?: Array<{
    key: string;
    label: string;
    value: string | number | boolean;
    sourceConnectorId?: string;
  }>;
  otherIncome?: {
    fdInterest?: number;
    fnoTurnover?: number;
    fnoProfit?: number;
  };
}

const CONNECTOR_LABELS: Record<string, string> = {
  form16: "Form 16",
  ais: "AIS (Annual Information Statement)",
  tis: "TIS (Taxpayer Information Summary)",
  cams: "CAMS Capital Gains Statement",
  broker_pnl: "Broker Tax P&L",
  groww: "Groww Excel",
  form26as: "Form 26AS",
};

export function connectorLabel(id: string): string {
  return CONNECTOR_LABELS[id] ?? id.replace(/_/g, " ");
}

function fmt(n: number | undefined): string | null {
  if (n == null || !Number.isFinite(n) || n === 0) return null;
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

/** Build document snapshot from draft store fields (client-safe). */
export function buildGenieDocumentSnapshot(input: {
  connectedConnectors: string[];
  income: {
    grossSalary: number;
    tds: number;
    employer: string;
    hraReceived?: number;
    actualRentPaid?: number;
    fdInterest?: number;
    fnoTurnover?: number;
    fnoNonSpeculativeProfit?: number;
    employers?: GenieEmployerRow[];
  };
  deductions: {
    section80C: number;
    section80D: number;
    npsExtra: number;
  };
  lastParseResult?: {
    connectorId: string;
    mode: string;
    fieldConfidence: Record<string, string>;
    warnings: string[];
    demo: boolean;
    filename?: string;
    filenames?: string[];
    parsedAt?: string;
  } | null;
  aisFigures?: {
    grossSalary?: number;
    tds?: number;
    fdInterest?: number;
  } | null;
  capitalGains?: {
    stcg_111a?: number;
    ltcg_112a?: number;
    stcg_other?: number;
    ltcg_other?: number;
    stcl_equity?: number;
    ltcl?: number;
    sourceConnectorId?: string;
  } | null;
  documentFacts?: Array<{
    key: string;
    label: string;
    value: string | number | boolean;
    sourceConnectorId?: string;
  }>;
}): GenieDocumentSnapshot | undefined {
  const { connectedConnectors, income, deductions, lastParseResult, aisFigures, capitalGains, documentFacts } =
    input;

  if (connectedConnectors.length === 0 && !documentFacts?.length) {
    // #region agent log
    fetch('http://127.0.0.1:7563/ingest/b08ac730-6614-46b3-bb0c-a50e7f63316c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'2c61ed'},body:JSON.stringify({sessionId:'2c61ed',location:'genieDocumentContext.ts:buildSnapshot',message:'snapshot undefined — no connectors or facts',data:{connectors:connectedConnectors.length,facts:documentFacts?.length??0},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    return undefined;
  }

  const snapshot: GenieDocumentSnapshot = {
    connectedConnectors: [...connectedConnectors],
  };

  if (lastParseResult) {
    snapshot.lastParse = {
      connectorId: lastParseResult.connectorId,
      connectorLabel: connectorLabel(lastParseResult.connectorId),
      filename: lastParseResult.filename,
      filenames: lastParseResult.filenames,
      mode: lastParseResult.mode,
      demo: lastParseResult.demo,
      warnings: lastParseResult.warnings ?? [],
      fieldConfidence: lastParseResult.fieldConfidence ?? {},
      parsedAt: lastParseResult.parsedAt,
    };
  }

  if (connectedConnectors.includes("form16") || income.grossSalary > 0) {
    snapshot.form16 = {
      employer: income.employer || undefined,
      grossSalary: income.grossSalary || undefined,
      tds: income.tds || undefined,
      hraReceived: income.hraReceived || undefined,
      actualRentPaid: income.actualRentPaid || undefined,
      section80C: deductions.section80C || undefined,
      section80D: deductions.section80D || undefined,
      npsExtra: deductions.npsExtra || undefined,
      employers:
        income.employers && income.employers.length > 0
          ? income.employers.map((e) => ({
              name: e.name,
              grossSalary: e.grossSalary,
              tds: e.tds,
            }))
          : undefined,
    };
  }

  if (aisFigures && (aisFigures.grossSalary || aisFigures.tds || aisFigures.fdInterest)) {
    snapshot.ais = { ...aisFigures };
  }

  if (
    capitalGains &&
    (capitalGains.stcg_111a ||
      capitalGains.ltcg_112a ||
      capitalGains.stcg_other ||
      capitalGains.ltcg_other ||
      capitalGains.stcl_equity ||
      capitalGains.ltcl)
  ) {
    snapshot.capitalGains = { ...capitalGains };
  }

  if (documentFacts?.length) {
    snapshot.documentFacts = documentFacts.slice(0, 40);
  }

  if (income.fdInterest || income.fnoTurnover || income.fnoNonSpeculativeProfit) {
    snapshot.otherIncome = {
      fdInterest: income.fdInterest || undefined,
      fnoTurnover: income.fnoTurnover || undefined,
      fnoProfit: income.fnoNonSpeculativeProfit || undefined,
    };
  }

  logSnapshotBuilt(snapshot);
  return snapshot;
}

function logSnapshotBuilt(snapshot: GenieDocumentSnapshot) {
  // #region agent log
  fetch('http://127.0.0.1:7563/ingest/b08ac730-6614-46b3-bb0c-a50e7f63316c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'2c61ed'},body:JSON.stringify({sessionId:'2c61ed',location:'genieDocumentContext.ts:buildSnapshot',message:'snapshot built',data:{connectors:snapshot.connectedConnectors,hasForm16:!!snapshot.form16,hasCams:!!snapshot.capitalGains,grossSalary:snapshot.form16?.grossSalary??null},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
  // #endregion
}

export function formatDocumentContextBlock(docs?: GenieDocumentSnapshot): string {
  if (!docs || docs.connectedConnectors.length === 0) return "";

  const lines: string[] = [
    "=== Documents uploaded & parsed (answer user questions from THESE numbers only) ===",
  ];

  lines.push(
    `• Connected: ${docs.connectedConnectors.map(connectorLabel).join(", ")}`
  );

  if (docs.lastParse) {
    const lp = docs.lastParse;
    const file = lp.filename ?? lp.filenames?.join(", ") ?? "uploaded file";
    lines.push(
      `• Last parsed: ${lp.connectorLabel} — ${file}${lp.demo ? " (demo/sample data)" : ""}`
    );
    if (lp.warnings.length) {
      lines.push(`• Parse warnings: ${lp.warnings.slice(0, 3).join("; ")}`);
    }
  }

  if (docs.form16) {
    const f = docs.form16;
    lines.push("• Form 16 extracted:");
    if (f.employer) lines.push(`  - Employer: ${f.employer}`);
    if (fmt(f.grossSalary)) lines.push(`  - Gross salary (Sec 17): ${fmt(f.grossSalary)}`);
    if (fmt(f.tds)) lines.push(`  - TDS deducted: ${fmt(f.tds)}`);
    if (fmt(f.hraReceived)) lines.push(`  - HRA received: ${fmt(f.hraReceived)}`);
    if (fmt(f.actualRentPaid)) lines.push(`  - Rent paid: ${fmt(f.actualRentPaid)}`);
    if (fmt(f.section80C)) lines.push(`  - 80C (from Form 16): ${fmt(f.section80C)}`);
    if (fmt(f.section80D)) lines.push(`  - 80D (from Form 16): ${fmt(f.section80D)}`);
    if (fmt(f.npsExtra)) lines.push(`  - NPS extra: ${fmt(f.npsExtra)}`);
    if (f.employers && f.employers.length > 1) {
      lines.push(`  - Multiple employers (${f.employers.length}):`);
      for (const e of f.employers) {
        lines.push(`    · ${e.name}: salary ${fmt(e.grossSalary)}, TDS ${fmt(e.tds)}`);
      }
    }
  }

  if (docs.ais) {
    const a = docs.ais;
    lines.push("• AIS extracted:");
    if (fmt(a.grossSalary)) lines.push(`  - Salary reported: ${fmt(a.grossSalary)}`);
    if (fmt(a.tds)) lines.push(`  - TDS reported: ${fmt(a.tds)}`);
    if (fmt(a.fdInterest)) lines.push(`  - FD/interest: ${fmt(a.fdInterest)}`);
  }

  if (docs.capitalGains) {
    const cg = docs.capitalGains;
    const src = cg.sourceConnectorId ? connectorLabel(cg.sourceConnectorId) : "CAMS/broker";
    lines.push(`• Capital gains from ${src}:`);
    if (fmt(cg.stcg_111a)) lines.push(`  - Equity STCG (111A): ${fmt(cg.stcg_111a)}`);
    if (fmt(cg.ltcg_112a)) lines.push(`  - Equity LTCG (112A): ${fmt(cg.ltcg_112a)}`);
    if (fmt(cg.stcg_other)) lines.push(`  - Other STCG: ${fmt(cg.stcg_other)}`);
    if (fmt(cg.ltcg_other)) lines.push(`  - Other LTCG: ${fmt(cg.ltcg_other)}`);
    if (fmt(cg.stcl_equity)) lines.push(`  - Equity STCL (loss): ${fmt(cg.stcl_equity)}`);
    if (fmt(cg.ltcl)) lines.push(`  - LTCL (loss): ${fmt(cg.ltcl)}`);
  }

  if (docs.otherIncome) {
    const o = docs.otherIncome;
    if (fmt(o.fdInterest)) lines.push(`• Bank/FD interest in draft: ${fmt(o.fdInterest)}`);
    if (fmt(o.fnoTurnover)) lines.push(`• F&O turnover: ${fmt(o.fnoTurnover)}`);
    if (o.fnoProfit != null && o.fnoProfit !== 0) {
      lines.push(
        `• F&O net P&L: ${fmt(Math.abs(o.fnoProfit))}${o.fnoProfit < 0 ? " (loss)" : " (profit)"}`
      );
    }
  }

  if (docs.documentFacts?.length) {
    lines.push("• Other extracted facts:");
    for (const fact of docs.documentFacts.slice(0, 12)) {
      const src = fact.sourceConnectorId ? ` (${connectorLabel(fact.sourceConnectorId)})` : "";
      lines.push(`  - ${fact.label}: ${fact.value}${src}`);
    }
  }

  return lines.join("\n");
}

/** Does the question ask about the user's uploaded/parsed documents? */
export function isDocumentPersonalQuestion(question: string): boolean {
  const n = question.toLowerCase();
  const signals = [
    "my form 16",
    "my salary",
    "my tds",
    "my employer",
    "my cams",
    "my upload",
    "my document",
    "my file",
    "my gross",
    "my hra",
    "my 80c",
    "my ltcg",
    "my stcg",
    "uploaded",
    "you read",
    "did you parse",
    "what did you extract",
    "from form 16",
    "from cams",
    "from ais",
    "from my",
    "in my form",
    "in my cams",
    "how much ltcg",
    "how much stcg",
    "how much capital",
    "summarize my",
    "summary of my",
    "what's in my",
    "what is in my",
    "read my",
    "parse result",
    "extracted from",
    "multiple employer",
    "two form 16",
    "job change",
    "ais vs",
    "mismatch between",
  ];
  return signals.some((s) => n.includes(s));
}

function pickValue(
  question: string,
  docs: GenieDocumentSnapshot
): { label: string; value: string; source: string } | null {
  const n = question.toLowerCase();

  if (
    (n.includes("employer") || n.includes("company")) &&
    docs.form16?.employer
  ) {
    return { label: "Employer", value: docs.form16.employer, source: "Form 16" };
  }

  if (
    (n.includes("gross") || n.includes("salary") || n.includes("section 17")) &&
    !n.includes("ais")
  ) {
    if (docs.form16?.grossSalary && fmt(docs.form16.grossSalary)) {
      return { label: "Gross salary", value: fmt(docs.form16.grossSalary)!, source: "Form 16" };
    }
    if (docs.ais?.grossSalary && fmt(docs.ais.grossSalary)) {
      return { label: "Salary (AIS)", value: fmt(docs.ais.grossSalary)!, source: "AIS" };
    }
  }

  if (n.includes("tds") || n.includes("tax deducted")) {
    if (docs.form16?.tds && fmt(docs.form16.tds)) {
      return { label: "TDS", value: fmt(docs.form16.tds)!, source: "Form 16" };
    }
    if (docs.ais?.tds && fmt(docs.ais.tds)) {
      return { label: "TDS (AIS)", value: fmt(docs.ais.tds)!, source: "AIS" };
    }
  }

  if (n.includes("hra") && docs.form16?.hraReceived && fmt(docs.form16.hraReceived)) {
    return { label: "HRA received", value: fmt(docs.form16.hraReceived)!, source: "Form 16" };
  }

  if ((n.includes("rent") || n.includes("80gg")) && docs.form16?.actualRentPaid && fmt(docs.form16.actualRentPaid)) {
    return { label: "Rent paid", value: fmt(docs.form16.actualRentPaid)!, source: "Form 16" };
  }

  if (n.includes("80c") && docs.form16?.section80C && fmt(docs.form16.section80C)) {
    return { label: "Section 80C", value: fmt(docs.form16.section80C)!, source: "Form 16" };
  }

  if (n.includes("80d") && docs.form16?.section80D && fmt(docs.form16.section80D)) {
    return { label: "Section 80D", value: fmt(docs.form16.section80D)!, source: "Form 16" };
  }

  if (n.includes("nps") && docs.form16?.npsExtra && fmt(docs.form16.npsExtra)) {
    return { label: "Extra NPS", value: fmt(docs.form16.npsExtra)!, source: "Form 16" };
  }

  if ((n.includes("interest") || n.includes("fd")) && !n.includes("home loan")) {
    if (docs.ais?.fdInterest) {
      return { label: "FD/interest (AIS)", value: fmt(docs.ais.fdInterest)!, source: "AIS" };
    }
    if (docs.otherIncome?.fdInterest) {
      return { label: "FD interest", value: fmt(docs.otherIncome.fdInterest)!, source: "Draft" };
    }
  }

  if (n.includes("ltcg") || n.includes("long term")) {
    if (docs.capitalGains?.ltcg_112a) {
      return {
        label: "Equity LTCG (112A)",
        value: fmt(docs.capitalGains.ltcg_112a)!,
        source: connectorLabel(docs.capitalGains.sourceConnectorId ?? "cams"),
      };
    }
    if (docs.capitalGains?.ltcl) {
      return {
        label: "LTCG loss",
        value: fmt(docs.capitalGains.ltcl)!,
        source: connectorLabel(docs.capitalGains.sourceConnectorId ?? "cams"),
      };
    }
  }

  if (n.includes("stcg") || n.includes("short term")) {
    if (docs.capitalGains?.stcg_111a) {
      return {
        label: "Equity STCG (111A)",
        value: fmt(docs.capitalGains.stcg_111a)!,
        source: connectorLabel(docs.capitalGains.sourceConnectorId ?? "cams"),
      };
    }
  }

  if (n.includes("capital gain") || n.includes("cams") || n.includes("mutual fund")) {
    const cg = docs.capitalGains;
    if (cg) {
      const parts: string[] = [];
      if (fmt(cg.stcg_111a)) parts.push(`STCG ${fmt(cg.stcg_111a)}`);
      if (fmt(cg.ltcg_112a)) parts.push(`LTCG ${fmt(cg.ltcg_112a)}`);
      if (fmt(cg.stcl_equity)) parts.push(`STCL loss ${fmt(cg.stcl_equity)}`);
      if (fmt(cg.ltcl)) parts.push(`LTCL loss ${fmt(cg.ltcl)}`);
      if (parts.length) {
        return {
          label: "Capital gains summary",
          value: parts.join(", "),
          source: connectorLabel(cg.sourceConnectorId ?? "cams"),
        };
      }
    }
  }

  if (n.includes("fno") || n.includes("f&o") || n.includes("turnover")) {
    if (docs.otherIncome?.fnoTurnover) {
      return {
        label: "F&O turnover",
        value: fmt(docs.otherIncome.fnoTurnover)!,
        source: "Broker P&L",
      };
    }
  }

  return null;
}

/** Deterministic answer from parsed documents — no LLM. */
export function answerFromDocuments(
  question: string,
  docs?: GenieDocumentSnapshot
): string | null {
  if (!docs || docs.connectedConnectors.length === 0) {
    if (isDocumentPersonalQuestion(question)) {
      return [
        "• I don't see any uploaded documents yet",
        "• Go to Import Documents and upload Form 16, AIS, or CAMS",
        "• After upload, ask me again — I'll read the extracted numbers",
      ].join("\n");
    }
    return null;
  }

  const n = question.toLowerCase();

  // Full document summary
  if (
    n.includes("summarize") ||
    n.includes("summary") ||
    n.includes("what did you read") ||
    n.includes("what's in my") ||
    n.includes("what is in my") ||
    n.includes("list my upload")
  ) {
    const lines: string[] = ["Here's what I read from your uploads:"];

    if (docs.form16) {
      const f = docs.form16;
      lines.push(
        `• Form 16${f.employer ? ` (${f.employer})` : ""}: salary ${fmt(f.grossSalary) ?? "—"}, TDS ${fmt(f.tds) ?? "—"}`
      );
      if (f.employers && f.employers.length > 1) {
        lines.push(`  - ${f.employers.length} employers combined`);
      }
    }
    if (docs.ais) {
      lines.push(
        `• AIS: salary ${fmt(docs.ais.grossSalary) ?? "—"}, TDS ${fmt(docs.ais.tds) ?? "—"}, interest ${fmt(docs.ais.fdInterest) ?? "—"}`
      );
    }
    if (docs.capitalGains) {
      const cg = docs.capitalGains;
      lines.push(
        `• ${connectorLabel(cg.sourceConnectorId ?? "cams")}: STCG ${fmt(cg.stcg_111a) ?? "—"}, LTCG ${fmt(cg.ltcg_112a) ?? "—"}`
      );
    }
    if (docs.lastParse?.warnings.length) {
      lines.push(`• Note: ${docs.lastParse.warnings[0]}`);
    }
    lines.push("• Ask about any specific number — e.g. \"my TDS\" or \"LTCG from CAMS\"");
    return lines.join("\n");
  }

  // Multiple employers
  if (
    (n.includes("job change") || n.includes("two form") || n.includes("multiple employer")) &&
    docs.form16?.employers &&
    docs.form16.employers.length > 1
  ) {
    const lines = [
      `• You have ${docs.form16.employers.length} Form 16 employers in your draft:`,
      ...docs.form16.employers.map(
        (e, i) =>
          `  ${i + 1}. ${e.name}: salary ${fmt(e.grossSalary)}, TDS ${fmt(e.tds)}`
      ),
      `• Combined salary: ${fmt(docs.form16.grossSalary)}`,
      `• Combined TDS: ${fmt(docs.form16.tds)}`,
      "• File one ITR — add both salaries on the portal",
    ];
    return lines.join("\n");
  }

  // AIS vs Form 16 mismatch hint
  if (
    (n.includes("mismatch") || n.includes("ais vs") || n.includes("different")) &&
    docs.form16 &&
    docs.ais
  ) {
    const lines = ["• Comparing your uploaded documents:"];
    if (docs.form16.grossSalary && docs.ais.grossSalary) {
      const diff = docs.ais.grossSalary - docs.form16.grossSalary;
      lines.push(
        `  - Form 16 salary: ${fmt(docs.form16.grossSalary)}`,
        `  - AIS salary: ${fmt(docs.ais.grossSalary)}`
      );
      if (Math.abs(diff) > 1000) {
        lines.push(
          `  - Difference: ${fmt(Math.abs(diff))} — check if AIS includes ex-employer or bonus`
        );
        lines.push("• Fix on Review → Import tab before filing");
      } else {
        lines.push("• Salary figures look aligned between Form 16 and AIS");
      }
    }
    if (docs.form16.tds && docs.ais.tds) {
      const tdsDiff = docs.ais.tds - docs.form16.tds;
      if (Math.abs(tdsDiff) > 500) {
        lines.push(
          `• TDS mismatch: Form 16 ${fmt(docs.form16.tds)} vs AIS ${fmt(docs.ais.tds)}`
        );
        lines.push("• Match Form 26AS before filing");
      }
    }
    return lines.join("\n");
  }

  const picked = pickValue(question, docs);
  if (picked) {
    return [
      `• From your ${picked.source}: **${picked.label}** = ${picked.value}`,
      docs.lastParse?.demo
        ? "• Note: this came from demo/sample parse — upload your real PDF for exact figures"
        : null,
      docs.lastParse?.fieldConfidence &&
      Object.values(docs.lastParse.fieldConfidence).includes("review")
        ? "• Some fields are marked for review — double-check on the Review screen"
        : null,
      "• These numbers are already in your draft — use Review to confirm before filing",
    ]
      .filter(Boolean)
      .join("\n")
      .replace(/\*\*/g, "");
  }

  if (isDocumentPersonalQuestion(question)) {
    return [
      "• I have your uploaded documents but couldn't match that exact field",
      "• Try: \"summarize my uploads\", \"my gross salary\", \"LTCG from CAMS\", \"TDS in Form 16\"",
      `• Connected: ${docs.connectedConnectors.map(connectorLabel).join(", ")}`,
    ].join("\n");
  }

  return null;
}
