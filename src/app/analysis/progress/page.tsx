"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogoMark } from "@/components/icons";

const STEPS = [
  "병변·피부 영역 분할하는 중",
  "1차 질환군 분류하는 중",
  "면적 비율·4징후 정량화하는 중",
  "이전 기록과 시점 간 비교하는 중",
];

export default function AnalysisProgressPage() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (stepIndex >= STEPS.length - 1) {
      const done = setTimeout(() => router.push("/analysis/result"), 700);
      return () => clearTimeout(done);
    }
    const timer = setTimeout(() => setStepIndex((i) => i + 1), 600);
    return () => clearTimeout(timer);
  }, [stepIndex, router]);

  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <div className="animate-pulse">
        <LogoMark className="h-14 w-14" />
      </div>
      <h1 className="mt-5 text-base font-bold text-foreground">AI가 분석하고 있어요</h1>

      <div className="mt-6 w-full space-y-2.5">
        {STEPS.map((step, i) => (
          <div key={step} className="flex items-center gap-2.5 text-left">
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                i < stepIndex
                  ? "bg-brand-600 text-white"
                  : i === stepIndex
                    ? "border-2 border-brand-600 text-brand-600"
                    : "border border-border text-border"
              }`}
            >
              {i < stepIndex ? "✓" : i + 1}
            </span>
            <span className={`text-sm ${i <= stepIndex ? "text-foreground" : "text-muted"}`}>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
