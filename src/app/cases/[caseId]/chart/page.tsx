"use client";

import { use, useState } from "react";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Card } from "@/components/ui/Card";
import { photoRecords } from "@/lib/mock-data";

const W = 300;
const H = 160;
const PAD = 24;

export default function AreaChartPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params);
  const shots = [...photoRecords.filter((p) => p.caseId === caseId)].sort((a, b) => (a.takenAt < b.takenAt ? -1 : 1));
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const maxRatio = Math.max(...shots.map((s) => s.areaRatio), 15);
  const threshold = 10; // conservative example threshold for "확대 추세" caution line

  function toX(i: number) {
    return PAD + (i * (W - PAD * 2)) / Math.max(shots.length - 1, 1);
  }
  function toY(ratio: number) {
    return H - PAD - (ratio / maxRatio) * (H - PAD * 2);
  }

  const linePoints = shots.map((s, i) => `${toX(i)},${toY(s.areaRatio)}`).join(" ");
  const thresholdY = toY(threshold);

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="면적 변화 그래프" backHref={`/cases/${caseId}/timeline`} />

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <Card>
          <p className="text-xs font-semibold text-muted">병변 면적 비율 (lesion / skin)</p>
          <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full">
            <line x1={PAD} y1={thresholdY} x2={W - PAD} y2={thresholdY} stroke="var(--color-status-caution)" strokeDasharray="4 3" strokeWidth="1" />
            <text x={W - PAD} y={thresholdY - 4} textAnchor="end" fontSize="8" fill="var(--color-status-caution)">
              주의 기준 {threshold}%
            </text>
            <polyline points={linePoints} fill="none" stroke="var(--color-brand-500)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {shots.map((s, i) => (
              <g key={s.id}>
                <circle
                  cx={toX(i)}
                  cy={toY(s.areaRatio)}
                  r={hoverIdx === i ? 5 : 3.5}
                  fill="var(--color-brand-600)"
                  onMouseEnter={() => setHoverIdx(i)}
                  onMouseLeave={() => setHoverIdx(null)}
                  onClick={() => setHoverIdx(i)}
                />
              </g>
            ))}
          </svg>
          <div className="mt-1 flex justify-between text-[10px] text-muted">
            {shots.map((s) => (
              <span key={s.id}>{s.takenAt.slice(5)}</span>
            ))}
          </div>

          {hoverIdx !== null && (
            <div className="mt-3 rounded-lg bg-canvas px-3 py-2 text-xs">
              <span className="font-semibold text-foreground">{shots[hoverIdx].takenAt}</span>
              <span className="ml-2 text-muted">면적 비율 {shots[hoverIdx].areaRatio}%</span>
            </div>
          )}
        </Card>

        <p className="mt-3 text-xs leading-relaxed text-muted">
          면적 비율 = 병변 픽셀 수 ÷ (피부 픽셀 수 + 병변 픽셀 수). 촬영 거리가 달라져도 화면에
          포착된 피부 전체를 분모로 삼아 비율이 비교적 안정적으로 유지됩니다.
        </p>
      </div>
    </div>
  );
}
