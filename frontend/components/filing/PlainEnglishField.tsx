"use client";

import { useState } from "react";
import { FieldLabel, TextInput } from "./ui";
import { HelpCircle, Languages } from "lucide-react";

export function PlainEnglishField({
  govLabel,
  simpleLabel,
  helper,
  glossaryTerm,
  value,
  onChange,
  placeholder,
  type = "text",
  maxLength,
  children,
}: {
  govLabel: string;
  simpleLabel: string;
  helper?: string;
  glossaryTerm?: string;
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  maxLength?: number;
  children?: React.ReactNode;
}) {
  const [showGov, setShowGov] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="mb-5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <FieldLabel>{showGov ? govLabel : simpleLabel}</FieldLabel>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowGov(!showGov)}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/5"
          >
            <Languages className="size-3" />
            {showGov ? "Simple" : "Gov term"}
          </button>
          {glossaryTerm && (
            <button
              type="button"
              onClick={() => setShowTooltip(!showTooltip)}
              className="inline-flex size-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-blue-50 hover:text-primary"
              aria-label={`What is ${glossaryTerm}?`}
            >
              <HelpCircle className="size-4" />
            </button>
          )}
        </div>
      </div>

      {showTooltip && glossaryTerm && (
        <div className="field-tooltip mb-2">
          <strong className="font-semibold">{glossaryTerm}</strong> — This is the official
          term used on incometax.gov.in. We show it in plain English by default so you
          know exactly what you&apos;re declaring.
        </div>
      )}

      {children ?? (
        <TextInput
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          type={type}
          maxLength={maxLength}
        />
      )}

      {helper && (
        <p className="mt-2 text-xs leading-relaxed text-slate-500">{helper}</p>
      )}
    </div>
  );
}
