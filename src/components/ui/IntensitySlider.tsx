"use client";

// 자가보고 증상(가려움·진물·통증·발열)은 5단계로 받는다 — 1(없음)~5(매우 심함).
const SYMPTOM_LEVELS = [1, 2, 3, 4, 5];
const SYMPTOM_LEVEL_LABEL = ["없음", "약간", "보통", "심함", "매우 심함"];

// EASI 4징후(홍반·구진·긁은자국·태선화)는 국제 표준 지표라 0~3 그대로 유지한다 -
// 위 자가보고 증상 스케일과 절대 공유하지 않는다(EASI 값은 임의로 바꾸면 안 됨).
const EASI_LEVELS = [0, 1, 2, 3];

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
        <span className="text-xs text-muted">{SYMPTOM_LEVEL_LABEL[value - 1]}</span>
      </div>
      <div className="flex gap-1.5">
        {SYMPTOM_LEVELS.map((level) => (
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
          {EASI_LEVELS.map((level) => (
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
