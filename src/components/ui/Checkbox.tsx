"use client";

import { CheckIcon } from "@/components/icons";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  required?: boolean;
}

export function Checkbox({ checked, onChange, label, description, required }: CheckboxProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-start gap-3 rounded-xl border border-border bg-surface px-3.5 py-3 text-left"
    >
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
          checked ? "border-brand-600 bg-brand-600" : "border-border bg-white"
        }`}
      >
        {checked && <CheckIcon className="h-3.5 w-3.5 text-white" />}
      </span>
      <span className="flex-1">
        <span className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="ml-1 text-accent-600">(필수)</span>}
        </span>
        {description && <span className="mt-0.5 block text-xs text-muted">{description}</span>}
      </span>
    </button>
  );
}
