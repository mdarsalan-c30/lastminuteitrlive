import fs from "fs";
import { resolve } from "path";
import { parseItdJsonToDraft } from "../frontend/lib/import/itdJsonParser";
import { draftToUserInput } from "../frontend/lib/engine/draftToUserInput";
import { calculateTax } from "../frontend/lib/engine/tax";

const jsonPath = resolve("./context/ITR3_JSon_AUTO-00007.json");
const jsonStr = fs.readFileSync(jsonPath, "utf-8");
const parsedJson = JSON.parse(jsonStr);

// Mock the initial draft structure since we don't have the Zustand store here
const mockDraft = {
  filingMode: "exact" as any,
  profile: { age: 30, residentialStatus: "resident" as any },
  matrix: { income: "salary", age: "adult", business: "none" },
  incomeChips: [],
  income: { grossSalary: 0, businessRevenue: 0, freelanceRevenue: 0 },
  houseProperty: {},
  extraProperties: [],
  carryForward: {},
  depreciationBlocks: [],
  deductions: {},
  connectedConnectors: [],
  capitalGains: null,
  mismatchResolved: false,
  recommendedForm: "ITR-1",
  questionAnswers: {}
};

try {
  const updatedDraft = parseItdJsonToDraft(parsedJson);
  const fullDraft = { ...mockDraft, ...updatedDraft };
  const userInput = draftToUserInput(fullDraft);
  const result = calculateTax(userInput);
  
  console.log("Recommended Form:", result.profile.itr_form);
  console.log("Draft Capital Gains state:", JSON.stringify(fullDraft.capitalGains, null, 2));
  console.log("UserInput CG:", JSON.stringify(userInput.capital_gains, null, 2));
  console.log("Engine CG Result:", result.income_heads.stcg_111a_net, result.income_heads.stcg_other_slab, result.income_heads.ltcg_112a_net, result.income_heads.ltcg_other_net);
} catch (err) {
  console.error("Error:", err);
}
