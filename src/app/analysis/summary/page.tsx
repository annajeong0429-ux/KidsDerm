"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ChevronRightIcon } from "@/components/icons";
import { cases, classificationResult } from "@/lib/mock-data";

const activeCase = cases[0];

function buildGuidanceText() {
  const changed = (activeCase.baselineAreaRatio - activeCase.latestAreaRatio).toFixed(1);
  if (activeCase.status === "호전") {
    return `병변 면적이 ${activeCase.daysObserved}일간 ${activeCase.baselineAreaRatio}%에서 ${activeCase.latestAreaRatio}%로 감소했습니다(−${changed}%p). 현재 처방을 유지하며 관찰하셔도 됩니다. 다만 새로운 증상이 생기면 병원 방문을 고려해 주세요.`;
  }
  if (activeCase.status === "확대 추세") {
    return `병변 면적이 ${activeCase.daysObserved}일간 ${activeCase.baselineAreaRatio}%에서 ${activeCase.latestAreaRatio}%로 확대되었습니다. 처방 이후의 변화이므로 담당 의료진과의 상담을 고려해 보시기 바랍니다.`;
  }
  return `병변 면적이 ${activeCase.daysObserved}일간 ${activeCase.baselineAreaRatio}%에서 ${activeCase.latestAreaRatio}%로 큰 변화 없이 유지되고 있습니다. 관찰을 지속하며 새로운 증상이 생기는지 확인해 주세요.`;
}

const evidenceItems = [
  { label: "1차 분류", value: `${classificationResult[0].name} 등 후보 ${classificationResult.length}건` },
  { label: "증상 기록", value: "가려움 보통, 진물 약함" },
  { label: "시계열 변화", value: `${activeCase.status} · 최근 ${activeCase.latestAreaRatio}%` },
  { label: "지역 유행 정보", value: "감염성 질환군 해당 없음" },
];

export default function AnalysisSummaryPage() {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="종합 참고 정보" backHref="/analysis/outbreak-context" />

      <div className="flex-1 overflow-y-auto px-6 pt-2">
        <Card>
          <p className="text-sm leading-relaxed text-foreground">{buildGuidanceText()}</p>
        </Card>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 flex w-full items-center justify-between rounded-xl border border-border bg-surface px-4 py-3"
        >
          <span className="text-sm font-medium text-foreground">근거 항목 보기</span>
          <ChevronRightIcon className={`h-4 w-4 text-muted transition-transform ${expanded ? "rotate-90" : ""}`} />
        </button>

        {expanded && (
          <div className="mt-2 space-y-2">
            {evidenceItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-xl bg-canvas px-4 py-2.5">
                <span className="text-xs font-semibold text-muted">{item.label}</span>
                <span className="text-xs text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        )}

        <p className="mt-4 text-xs leading-relaxed text-muted">
          동일한 입력에는 항상 동일한 문구가 생성되며, 안내 내용의 일관성과 추적 가능성이
          보장됩니다.
        </p>
      </div>

      <div className="px-6 pb-6 pt-3">
        <Button fullWidth size="lg" onClick={() => router.push("/analysis/disclaimer")}>
          다음
        </Button>
      </div>
    </div>
  );
}
