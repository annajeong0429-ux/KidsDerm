"use client";

import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Card } from "@/components/ui/Card";
import { MapPinIcon, TrendDownIcon, TrendUpIcon } from "@/components/icons";
import { outbreakEntries } from "@/lib/mock-data";
import { useChildProfile } from "@/lib/child-profile-context";

const trendColor = {
  증가: "text-status-caution",
  유지: "text-status-maintain",
  감소: "text-status-improve",
} as const;

export default function OutbreakPage() {
  const { childProfile } = useChildProfile();
  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="우리 지역 유행 현황" backHref="/" />

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <MapPinIcon className="h-3.5 w-3.5" />
          {childProfile.region.province} {childProfile.region.district}
        </div>
        <p className="mt-0.5 text-[11px] text-muted">
          출처: 질병관리청 전수신고 감염병 발생현황 오픈API · 2026.08.14 06:00 기준 갱신
        </p>

        <Card className="mt-4">
          <p className="text-xs font-semibold text-muted">최근 4주 신고 건수 추이 (질환별)</p>
          <svg viewBox="0 0 300 110" className="mt-3 h-28 w-full">
            <polyline
              points="0,80 60,70 120,55 180,40 240,25 300,15"
              fill="none"
              stroke="var(--color-status-caution)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <polyline
              points="0,95 60,92 120,90 180,93 240,88 300,90"
              fill="none"
              stroke="var(--color-brand-400)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
          <div className="flex gap-4 text-[11px] text-muted">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-status-caution" /> 수족구병
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-brand-400" /> 수두
            </span>
          </div>
        </Card>

        <div className="mt-4 space-y-2.5">
          {outbreakEntries.map((o) => (
            <Card key={o.diseaseName} className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{o.diseaseName}</span>
              <span className={`flex items-center gap-1 text-sm font-semibold ${trendColor[o.trend]}`}>
                {o.trend === "증가" && <TrendUpIcon className="h-4 w-4" />}
                {o.trend === "감소" && <TrendDownIcon className="h-4 w-4" />}
                {o.trend} {o.changeRate > 0 ? "+" : ""}
                {o.changeRate}%
              </span>
            </Card>
          ))}
        </div>

        <p className="mt-4 text-xs leading-relaxed text-muted">
          신고 건수 증가는 해당 지역·시기에 발생 위험이 높아졌다는 참고 정보이며, 우리 아이의 실제 감염 여부를
          의미하지 않습니다. 의심 증상이 있다면 분석 결과 화면에서 함께 확인하세요.
        </p>
      </div>
    </div>
  );
}
