"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ITR_TYPE_QUIZ,
  suggestItrType,
  type ItrQuizAnswers,
} from "@/lib/content/hooks";
import { cn } from "@/lib/utils";
import { ArrowRight, ClipboardList } from "lucide-react";

const EMPTY_ANSWERS: ItrQuizAnswers = {
  income: "",
  employers: "",
  property: "",
  income_level: "",
  residency: "",
};

export function ItrTypeQuiz() {
  const [answers, setAnswers] = useState<ItrQuizAnswers>(EMPTY_ANSWERS);
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = ITR_TYPE_QUIZ.questions.every(
    (q) => answers[q.id as keyof ItrQuizAnswers] !== ""
  );

  const resultKey = useMemo(() => {
    if (!submitted || !allAnswered) return null;
    return suggestItrType(answers);
  }, [answers, allAnswered, submitted]);

  const result = resultKey ? ITR_TYPE_QUIZ.results[resultKey] : null;

  return (
    <div className="landing-card !p-4 sm:!p-5">
      <div className="flex items-start gap-2">
        <ClipboardList className="mt-0.5 size-4 shrink-0 text-primary" />
        <div>
          <h3 className="text-sm font-semibold text-foreground sm:text-base">
            {ITR_TYPE_QUIZ.headline}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
            {ITR_TYPE_QUIZ.subhead}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
        {ITR_TYPE_QUIZ.questions.map((question) => (
          <fieldset key={question.id} className="min-w-0">
            <legend className="text-xs font-medium text-foreground">
              {question.prompt}
            </legend>
            <div className="mt-1.5 flex flex-col gap-1.5">
              {question.options.map((option) => {
                const selected =
                  answers[question.id as keyof ItrQuizAnswers] === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setAnswers((prev) => ({
                        ...prev,
                        [question.id]: option.value,
                      }));
                    }}
                    className={cn(
                      "w-full rounded-lg border px-2.5 py-1.5 text-left text-xs font-medium transition",
                      selected
                        ? "border-primary bg-blue-100 text-primary"
                        : "border-gray-200 bg-white text-foreground shadow-sm hover:border-gray-300 hover:bg-muted/40"
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/50 pt-3">
        <button
          type="button"
          disabled={!allAnswered}
          onClick={() => setSubmitted(true)}
          className="inline-flex min-h-9 items-center justify-center rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
        >
          See suggestion
        </button>
        <button
          type="button"
          onClick={() => {
            setAnswers(EMPTY_ANSWERS);
            setSubmitted(false);
          }}
          className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline sm:text-sm"
        >
          Reset
        </button>
      </div>

      {result && resultKey ? (
        <div
          className={cn(
            "mt-3 rounded-xl border p-3 sm:p-4",
            resultKey === "talkToCa"
              ? "border-amber-300/80 bg-amber-50/50"
              : "border-emerald-300/80 bg-emerald-50/50"
          )}
        >
          <p className="text-sm font-semibold text-foreground">{result.form}</p>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            {result.summary}
          </p>
          <p className="mt-2 text-tier-legal text-muted-foreground">
            Rule-based suggestion only — confirm on incometax.gov.in before submitting.
          </p>
          <Link
            href={result.href}
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline sm:text-sm"
          >
            Continue to filing prep
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}
