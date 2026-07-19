import fs from "fs";
import { parseItdJsonToDraft } from "./lib/import/itdJsonParser";
import { draftToUserInput } from "./lib/engine/draftToUserInput";
import { calculateTax } from "./lib/engine/tax";
import { resolve } from "path";

const jsonPath = resolve("../context/ITR3_JSon_AUTO-00007.json");
const jsonStr = fs.readFileSync(jsonPath, "utf-8");
const parsedJson = JSON.parse(jsonStr);
const draft = parseItdJsonToDraft(parsedJson);

const userInput = draftToUserInput(draft);
const result = calculateTax(userInput);

console.log("Recommended Form:", result.profile.itr_form);
console.log("Draft Recommended Form:", draft.recommendedForm);
console.log("Capital Gains (111A, OtherST, 112A, OtherLT):", result.income_heads.stcg_111a_net, result.income_heads.stcg_other_slab, result.income_heads.ltcg_112a_net, result.income_heads.ltcg_other_net);
console.log("Has CG logic check (> 0):", (result.income_heads.stcg_111a_net > 0 || result.income_heads.stcg_other_slab > 0 || result.income_heads.ltcg_112a_net > 0 || result.income_heads.ltcg_other_net > 0));
console.log("Business object:", userInput.business);
