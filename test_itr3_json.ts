import fs from "fs";
import { parseItdJsonToDraft } from "./frontend/lib/import/itdJsonParser";
import { draftToUserInput } from "./frontend/lib/engine/draftToUserInput";
import { calculateTax } from "./frontend/lib/engine/tax";

const jsonStr = fs.readFileSync("context/ITR3_JSon_AUTO-00007.json", "utf-8");
const parsedJson = JSON.parse(jsonStr);
const draft = parseItdJsonToDraft(parsedJson);

const userInput = draftToUserInput(draft);
const result = calculateTax(userInput);

console.log("Recommended Form:", result.profile.itr_form);
console.log("Draft Recommended Form:", draft.recommendedForm);
console.log("Capital Gains:", result.income_heads.stcg_111a_net, result.income_heads.stcg_other_slab, result.income_heads.ltcg_112a_net, result.income_heads.ltcg_other_net);
console.log("Result:", JSON.stringify(result, null, 2));
