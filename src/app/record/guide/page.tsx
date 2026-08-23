"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";

const TIPS = [
  { title: "같은 거리에서 촬영해요", body: "이전 사진과 비슷한 거리를 유지하면 면적 비교가 정확해져요" },
  { title: "밝은 곳에서 촬영해요", body: "자연광이나 밝은 조명 아래에서 그림자 없이 촬영해 주세요" },
  { title: "정면에서 촬영해요", body: "병변 부위가 화면 중앙에 오도록 각도를 맞춰 주세요" },
];

export default function RecordGuidePage() {
  const router = useRouter();
  const [dontShowAgain, setDontShowAgain] = useState(false);

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="촬영 가이드" backHref="/" />

      <div className="flex-1 px-6 pt-2">
        <div className="flex h-40 items-center justify-center rounded-2xl bg-brand-50">
          <svg viewBox="0 0 120 120" className="h-24 w-24">
            <rect x="20" y="20" width="80" height="80" rx="10" fill="none" stroke="var(--color-brand-400)" strokeWidth="2" strokeDasharray="6 5" />
            <circle cx="60" cy="60" r="22" fill="var(--color-accent-200)" />
            <path d="M20 20 L40 20 M20 20 L20 40 M100 20 L80 20 M100 20 L100 40 M20 100 L40 100 M20 100 L20 80 M100 100 L80 100 M100 100 L100 80" stroke="var(--color-brand-600)" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>

        <div className="mt-5 space-y-3">
          {TIPS.map((tip) => (
            <div key={tip.title} className="flex gap-3 rounded-xl border border-border bg-surface p-3.5">
              <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
              <div>
                <p className="text-sm font-semibold text-foreground">{tip.title}</p>
                <p className="mt-0.5 text-xs text-muted">{tip.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 px-6 pb-6 pt-3">
        <Checkbox checked={dontShowAgain} onChange={setDontShowAgain} label="다시 보지 않기" />
        <Button fullWidth size="lg" onClick={() => router.push("/record/camera")}>
          촬영 시작하기
        </Button>
      </div>
    </div>
  );
}
