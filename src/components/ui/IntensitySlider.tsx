"use client";

const LEVELS = [0, 1, 2, 3];
const LEVEL_LABEL = ["없음", "약함", "보통", "심함"];

export function IntensitySlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-xs text-muted">{LEVEL_LABEL[value]}</span>
      </div>
      <div className="flex gap-1.5">
        {LEVELS.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level)}
            className={`h-9 flex-1 rounded-lg text-sm font-semibold transition-colors ${
              level <= value
                ? "bg-brand-600 text-white"
                : "bg-canvas text-muted border border-border"
            }`}
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SignReadout({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {LEVELS.map((level) => (
            <span
              key={level}
              className={`h-1.5 w-5 rounded-full ${level <= value ? "bg-brand-600" : "bg-border"}`}
            />
          ))}
        </div>
        <span className="w-6 text-right text-xs font-semibold text-muted">{value}</span>
      </div>
    </div>
  );
}
