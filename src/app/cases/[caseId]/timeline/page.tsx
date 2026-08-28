"use client";

import { use, useEffect, useState } from "react";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { TrendBadge } from "@/components/ui/Badge";
import { CameraIcon, CalendarIcon } from "@/components/icons";
import { DisclaimerBanner } from "@/components/ui/Disclaimer";
import {
  getCase,
  listDiagnoses,
  type CaseDetail,
  type DiagnosisWithPrescriptions,
  type PhotoRecordWithSymptoms,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { PhotoThumb } from "@/components/ui/PhotoThumb";

type Event =
  | { type: "photo"; date: string; data: PhotoRecordWithSymptoms }
  | { type: "diagnosis"; date: string; data: DiagnosisWithPrescriptions };

export default function CaseTimelinePage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params);
  const { accessToken, loading: authLoading } = useAuth();
  const [detail, setDetail] = useState<CaseDetail | null>(null);
  const [diagnoses, setDiagnoses] = useState<DiagnosisWithPrescriptions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // 새로고침 직후에는 로그인 복원이 아직 안 끝나 토큰이 없다.
    // 그대로 요청하면 무조건 401이 나므로, 복원이 끝날 때까지 기다린다.
    if (authLoading) return;

    let cancelled = false;
    (async () => {
      try {
        // 사진과 진단을 함께 받아야 타임라인이 완성되므로 둘을 나란히 요청한다.
        const [caseDetail, dxList] = await Promise.all([
          getCase(accessToken, caseId),
          listDiagnoses(accessToken, caseId),
        ]);
        if (cancelled) return;
        setDetail(caseDetail);
        setDiagnoses(dxList);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "불러오지 못했어요.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accessToken, authLoading, caseId]);

  if (loading) {
    return (
      <div className="flex h-full flex-col">
        <ScreenHeader title="경과 타임라인" backHref="/cases" />
        <p className="px-5 pt-10 text-center text-sm text-muted">불러오는 중...</p>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="flex h-full flex-col">
        <ScreenHeader title="경과 타임라인" backHref="/cases" />
        <p className="px-5 pt-10 text-center text-sm text-muted">{error || "사례를 찾을 수 없어요."}</p>
      </div>
    );
  }

  const activeCase = detail.case;
  const events: Event[] = [
    ...detail.photos.map((p) => ({ type: "photo" as const, date: p.takenAt, data: p })),
    ...diagnoses.map((d) => ({ type: "diagnosis" as const, date: d.date, data: d })),
  ].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="경과 타임라인" backHref="/cases" />

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <div className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4">
          <div>
            <p className="text-sm font-bold text-foreground">{activeCase.bodyPart}</p>
            <p className="mt-0.5 text-xs text-muted">관찰 {activeCase.daysObserved}일째</p>
          </div>
          <TrendBadge status={activeCase.status} />
        </div>

        {events.length === 0 && (
          <p className="pt-10 text-center text-sm text-muted">아직 기록이 없어요.</p>
        )}

        <div className="relative mt-5 space-y-5 pl-6">
          <div className="absolute bottom-2 left-[9px] top-2 w-px bg-border" />
          {events.map((event, i) => (
            <div key={i} className="relative flex gap-3">
              <span className="absolute -left-6 top-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-brand-600 ring-4 ring-canvas">
                {event.type === "photo" ? (
                  <CameraIcon className="h-2.5 w-2.5 text-white" />
                ) : (
                  <CalendarIcon className="h-2.5 w-2.5 text-white" />
                )}
              </span>
              {event.type === "photo" ? (
                <div className="flex flex-1 items-center gap-3 rounded-xl border border-border bg-surface p-3">
                  <PhotoThumb photo={event.data} className="h-12 w-12 shrink-0 rounded-lg" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">{event.date} · 촬영 기록</p>
                    <p className="mt-0.5 text-xs text-muted">면적 비율 {event.data.areaRatio}%</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 rounded-xl border border-brand-200 bg-brand-50 p-3">
                  <p className="text-xs font-semibold text-brand-800">{event.date} · 진료 · {event.data.hospitalName}</p>
                  <p className="mt-0.5 text-xs text-brand-700">{event.data.diagnosisName} 진단 (경과 관찰 기준점)</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-5">
          <DisclaimerBanner />
        </div>
      </div>
    </div>
  );
}
