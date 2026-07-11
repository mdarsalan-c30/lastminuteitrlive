import { describe, expect, it } from "vitest";
import { generateProfessionQuestions, PROFESSION_OPTIONS } from "../professionQuestions";

describe("professionQuestions", () => {
  it("asks doctors about indemnity, equipment, and pharmacy split", () => {
    const qs = generateProfessionQuestions({
      profession: "doctor",
      incomeChips: ["salary", "freelance"],
    });
    const ids = qs.map((q) => q.id);
    expect(ids).toContain("prof_doctor_indemnity");
    expect(ids).toContain("prof_doctor_equipment");
    expect(ids).toContain("prof_doctor_pharmacy");
  });

  it("asks lawyers about chamber expenses", () => {
    const qs = generateProfessionQuestions({
      profession: "lawyer",
      incomeChips: ["freelance"],
    });
    expect(qs.some((q) => q.id === "prof_lawyer_chamber")).toBe(true);
  });

  it("asks salaried-only users the side-income opener", () => {
    const qs = generateProfessionQuestions({
      profession: null,
      incomeChips: ["salary"],
    });
    expect(qs).toHaveLength(1);
    expect(qs[0].id).toBe("prof_side_income");
  });

  it("skips answered questions", () => {
    const qs = generateProfessionQuestions({
      profession: "doctor",
      incomeChips: ["freelance"],
      questionAnswers: { prof_doctor_indemnity: { answer: "no" } },
    });
    expect(qs.some((q) => q.id === "prof_doctor_indemnity")).toBe(false);
  });

  it("returns nothing without profession for business users", () => {
    const qs = generateProfessionQuestions({
      profession: null,
      incomeChips: ["freelance"],
    });
    expect(qs).toHaveLength(0);
  });

  it("every option id with a bank entry produces questions", () => {
    for (const opt of PROFESSION_OPTIONS) {
      const qs = generateProfessionQuestions({
        profession: opt.id,
        incomeChips: ["freelance"],
      });
      // "other" has no bank entry by design
      if (opt.id !== "other") {
        expect(qs.length).toBeGreaterThan(0);
      }
    }
  });
});
