"use client";

import { useState } from "react";
import Link from "next/link";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Badge";
import { SignReadout } from "@/components/ui/IntensitySlider";
import { DisclaimerBanner } from "@/components/ui/Disclaimer";
import { photoRecords } from "@/lib/mock-data";

// 이번 촬영 분석 결과 - RC 촬영 흐름과 이 화면이 아직 상태를 공유하지 않아서(별도 레이아웃
// 트리라 record-context가 유지되지 않음), AN-02(1차 분류)와 같은 방식으로 케이스-1의 가장
// 최근 촬영 기록을 "이번 분석 결과"로 표시한다.
const latestShot = photoRecords[photoRecords.length - 1];

export default function SeverityResultPage() {
  const [viewMode, setViewMode] = useState<"original" | "mask">("mask");

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="중증도·면적 결과" backHref="/analysis/result" />

      <div className="flex-1 overflow-y-auto px-6 pt-2">
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted">병변 분할 결과</p>
            <div className="flex rounded-full border border-border bg-canvas p-0.5">
              {(["original", "mask"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    viewMode === mode ? "bg-brand-600 text-white" : "text-muted"
                  }`}
                >
                  {mode === "original" ? "원본" : "분할 마스크"}
                </button>
              ))}
            </div>
          </div>

          <div className="relative mt-3 aspect-square w-full overflow-hidden rounded-2xl">
            <div className="absolute inset-0" style={{ backgroundColor: latestShot.imageColor }} />
            {viewMode === "mask" && (
              <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
                <path
                  d="M38 28 C 30 30, 24 40, 27 50 C 22 56, 24 66, 33 70 C 40 76, 52 75, 58 68 C 68 66, 72 55, 66 46 C 70 38, 64 28, 54 27 C 48 22, 42 23, 38 28 Z"
                  fill="var(--color-accent-500)"
                  fillOpacity={0.55}
                  stroke="var(--color-accent-600)"
                  strokeWidth={1.5}
                />
              </svg>
            )}
            <span className="absolute left-2 top-2 rounded-full bg-black/45 px-2 py-1 text-[11px] text-white">
              {latestShot.takenAt} · {latestShot.bodyPart}
            </span>
          </div>

          {viewMode === "mask" && (
            <div className="mt-2.5 flex justify-center gap-4 text-[11px] text-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: latestShot.imageColor }} />
                피부 영역
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-accent-500" />
                병변 영역
              </span>
            </div>
          )}
        </Card>

        <Card className="mt-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted">병변 면적 비율</p>
            <Pill tone="brand">EASI 구성 요소 기반 부위 중증도</Pill>
          </div>
          <p className="mt-2 text-3xl font-bold text-foreground">{latestShot.areaRatio}%</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            촬영된 부위 단위의 중증도 지표이며, 전신을 평가하는 EASI 총점이 아닙니다. 면적 비율
            = 병변 픽셀 수 ÷ (피부 픽셀 수 + 병변 픽셀 수).
          </p>
        </Card>

        <Card className="mt-4 space-y-3">
          <p className="text-xs font-semibold text-muted">4징후 점수 (0~3)</p>
          <SignReadout label="홍반" value={latestShot.signs.erythema} />
          <SignReadout label="구진" value={latestShot.signs.papulation} />
          <SignReadout label="긁은 자국" value={latestShot.signs.excoriation} />
          <SignReadout label="태선화" value={latestShot.signs.lichenification} />
        </Card>

        <div className="mt-4">
          <DisclaimerBanner />
        </div>
      </div>

      <div className="px-6 pb-6 pt-3">
        <Link href="/analysis/outbreak-context">
          <Button fullWidth size="lg">
            다음
          </Button>
        </Link>
      </div>
    </div>
  );
}
