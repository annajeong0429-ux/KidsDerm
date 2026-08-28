"use client";

import { use, useEffect, useState } from "react";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Card } from "@/components/ui/Card";
import { DisclaimerBanner } from "@/components/ui/Disclaimer";
import {
  getCase,
  listDiagnoses,
  type DiagnosisWithPrescriptions,
  type PhotoRecordWithSymptoms,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { SeaseFourSigns } from "@/lib/types";

const W = 300;
const H = 160;
const PAD = 24;

type SignKey = keyof SeaseFourSigns;

const SIGN_META: { key: SignKey; label: string; color: string }[] = [
  { key: "erythema", label: "홍반", color: "#e0575b" },
  { key: "papulation", label: "구진", color: "#8b5cf6" },
  { key: "excoriation", label: "긁은 자국", color: "#f59e0b" },
  { key: "lichenification", label: "태선화", color: "#3b82f6" },
];

// 날짜가 촬영 시점들 사이 어디쯔음 오는지 소수 인덱스로 환산한다 (처방 시점 세로선 위치용).
function dateToFractionalIndex(dateStr: string, shotDates: string[]): number {
  const target = new Date(dateStr).getTime();
  const times = shotDates.map((d) => new Date(d).getTime());
  if (target <= times[0]) return 0;
  if (target >= times[times.length - 1]) return times.length - 1;
  for (let i = 0; i < times.length - 1; i++) {
    if (target >= times[i] && target <= times[i + 1]) {
      const frac = (target - times[i]) / (times[i + 1] - times[i]);
      return i + frac;
    }
  }
  return 0;
}

export default function AreaChartPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params);
  const { accessToken, loading: authLoading } = useAuth();
  const [shots, setShots] = useState<PhotoRecordWithSymptoms[]>([]);
  const [prescription, setPrescription] = useState<DiagnosisWithPrescriptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [view, setView] = useState<"area" | "signs">("area");
  const [visibleSigns, setVisibleSigns] = useState<Set<SignKey>>(
    new Set(SIGN_META.map((s) => s.key))
  );

  useEffect(() => {
    // 로그인 복원이 끝나기 전에는 토큰이 없어서 요청해봐야 401이 난다.
    if (authLoading) return;

    let cancelled = false;
    (async () => {
      try {
        const [detail, dxList] = await Promise.all([
          getCase(accessToken, caseId),
          listDiagnoses(accessToken, caseId),
        ]);
        if (cancelled) return;
        setShots(detail.photos);
        // 그래프의 세로선은 "치료를 시작한 시점"을 보여주는 것이라 가장 이른 진단을 쓴다.
        setPrescription(dxList[0] ?? null);
      } catch {
        if (!cancelled) setShots([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accessToken, authLoading, caseId]);

  const maxRatio = Math.max(...shots.map((s) => s.areaRatio), 15);
  const threshold = 10; // conservative example threshold for "확대 추세" caution line

  function toX(i: number) {
    return PAD + (i * (W - PAD * 2)) / Math.max(shots.length - 1, 1);
  }
  function toYArea(ratio: number) {
    return H - PAD - (ratio / maxRatio) * (H - PAD * 2);
  }
  function toYSign(value: number) {
    return H - PAD - (value / 3) * (H - PAD * 2);
  }

  const areaLinePoints = shots.map((s, i) => `${toX(i)},${toYArea(s.areaRatio)}`).join(" ");
  const thresholdY = toYArea(threshold);

  // 사진이 없으면 가로축 자체가 없어서 세로선을 그릴 자리도 없다.
  const prescriptionX =
    prescription && shots.length > 0
      ? toX(dateToFractionalIndex(prescription.date, shots.map((s) => s.takenAt)))
      : null;

  function toggleSign(key: SignKey) {
    setVisibleSigns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  if (loading || shots.length === 0) {
    return (
      <div className="flex h-full flex-col">
        <ScreenHeader title="면적·징후 변화 그래프" backHref={`/cases/${caseId}/timeline`} />
        <p className="px-5 pt-10 text-center text-sm text-muted">
          {loading ? "불러오는 중..." : "아직 촬영 기록이 없어 그래프를 그릴 수 없어요."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="면적·징후 변화 그래프" backHref={`/cases/${caseId}/timeline`} />

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted">
              {view === "area" ? "병변 면적 비율 (lesion / skin)" : "4징후 점수 변화 (0~3)"}
            </p>
            <div className="flex rounded-full border border-border bg-canvas p-0.5">
              {(["area", "signs"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setView(mode)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    view === mode ? "bg-brand-600 text-white" : "text-muted"
                  }`}
                >
                  {mode === "area" ? "면적 비율" : "4징후 점수"}
                </button>
              ))}
            </div>
          </div>

          <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full">
            {view === "area" && (
              <>
                <line
                  x1={PAD}
                  y1={thresholdY}
                  x2={W - PAD}
                  y2={thresholdY}
                  stroke="var(--color-status-caution)"
                  strokeDasharray="4 3"
                  strokeWidth="1"
                />
                <text x={W - PAD} y={thresholdY - 4} textAnchor="end" fontSize="8" fill="var(--color-status-caution)">
                  주의 기준 {threshold}%
                </text>
              </>
            )}

            {prescriptionX !== null && (
              <>
                <line x1={prescriptionX} y1={PAD - 8} x2={prescriptionX} y2={H - PAD} stroke="var(--color-muted)" strokeDasharray="2 2" strokeWidth="1" />
                <text x={prescriptionX} y={PAD - 10} textAnchor="middle" fontSize="8" fill="var(--color-muted)">
                  처방
                </text>
              </>
            )}

            {view === "area" ? (
              <>
                <polyline points={areaLinePoints} fill="none" stroke="var(--color-brand-500)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {shots.map((s, i) => (
                  <circle
                    key={s.id}
                    cx={toX(i)}
                    cy={toYArea(s.areaRatio)}
                    r={hoverIdx === i ? 5 : 3.5}
                    fill="var(--color-brand-600)"
                    onMouseEnter={() => setHoverIdx(i)}
                    onMouseLeave={() => setHoverIdx(null)}
                    onClick={() => setHoverIdx(i)}
                  />
                ))}
              </>
            ) : (
              SIGN_META.filter((sign) => visibleSigns.has(sign.key)).map((sign) => (
                <g key={sign.key}>
                  <polyline
                    points={shots.map((s, i) => `${toX(i)},${toYSign(s.signs[sign.key])}`).join(" ")}
                    fill="none"
                    stroke={sign.color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {shots.map((s, i) => (
                    <circle
                      key={s.id}
                      cx={toX(i)}
                      cy={toYSign(s.signs[sign.key])}
                      r={hoverIdx === i ? 4 : 3}
                      fill={sign.color}
                      onMouseEnter={() => setHoverIdx(i)}
                      onMouseLeave={() => setHoverIdx(null)}
                      onClick={() => setHoverIdx(i)}
                    />
                  ))}
                </g>
              ))
            )}
          </svg>

          <div className="mt-1 flex justify-between text-[10px] text-muted">
            {shots.map((s) => (
              <span key={s.id}>{s.takenAt.slice(5)}</span>
            ))}
          </div>

          {view === "signs" && (
            <div className="mt-3 flex flex-wrap gap-2">
              {SIGN_META.map((sign) => {
                const on = visibleSigns.has(sign.key);
                return (
                  <button
                    key={sign.key}
                    onClick={() => toggleSign(sign.key)}
                    className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-opacity ${
                      on ? "border-border" : "border-border opacity-40"
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: sign.color }} />
                    {sign.label}
                  </button>
                );
              })}
            </div>
          )}

          {hoverIdx !== null && (
            <div className="mt-3 rounded-lg bg-canvas px-3 py-2 text-xs">
              <span className="font-semibold text-foreground">{shots[hoverIdx].takenAt}</span>
              {view === "area" ? (
                <span className="ml-2 text-muted">면적 비율 {shots[hoverIdx].areaRatio}%</span>
              ) : (
                <span className="ml-2 text-muted">
                  홍반 {shots[hoverIdx].signs.erythema} · 구진 {shots[hoverIdx].signs.papulation} · 긁은 자국{" "}
                  {shots[hoverIdx].signs.excoriation} · 태선화 {shots[hoverIdx].signs.lichenification}
                </span>
              )}
            </div>
          )}
        </Card>

        <p className="mt-3 text-xs leading-relaxed text-muted">
          {view === "area"
            ? "면적 비율 = 병변 픽셀 수 ÷ (피부 픽셀 수 + 병변 픽셀 수). 촬영 거리가 달라져도 화면에 포착된 피부 전체를 분모로 삼아 비율이 비교적 안정적으로 유지됩니다."
            : "점선(처방)을 기준으로 처방 전후 4징후 점수 변화를 함께 확인하면, 면적만 볼 때 놓칠 수 있는 국소 악화·호전 양상을 파악하는 데 도움이 됩니다."}
        </p>

        <div className="mt-4">
          <DisclaimerBanner />
        </div>
      </div>
    </div>
  );
}
