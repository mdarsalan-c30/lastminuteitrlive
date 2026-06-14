import type { DraftState } from "@/lib/store/draft";
import type { UserInput } from "@/lib/engine/types";
import type { ItrQuizAnswers } from "@/lib/content/hooks";

export type DraftSlice = Pick<
  DraftState,
  | "filingMode"
  | "profile"
  | "matrix"
  | "incomeChips"
  | "income"
  | "houseProperty"
  | "deductions"
  | "connectedConnectors"
>;

export interface ScenarioExpectation {
  noThrow: boolean;
  itrForm?: string;
  handoffKeys?: string[];
  quizOutcome?: "itr1" | "itr2" | "talkToCa";
}

export interface SimulationScenario {
  id: string;
  name: string;
  draftSlice: DraftSlice;
  userInput?: UserInput;
  entryCta?: string;
  quizAnswers?: ItrQuizAnswers;
  expected: ScenarioExpectation;
}

export interface ScenarioRunResult {
  id: string;
  passed: boolean;
  error?: string;
  durationMs: number;
  itrForm?: string;
  recommendedRegime?: string;
}

export interface BatchRunSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  durationMs: number;
  failures: ScenarioRunResult[];
}
