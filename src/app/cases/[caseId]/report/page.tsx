"use client";

import { use, useEffect, useState } from "react";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { TrendBadge } from "@/components/ui/Badge";
import { DisclaimerBanner } from "@/components/ui/Disclaimer";
import { PhotoThumb } from "@/components/ui/PhotoThumb";
import {
  fetchReportPdf,
  getCase,
  listDiagnoses,
  type CaseDetail,
  type DiagnosisWithPrescriptions,
  type ReportSection,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useChildProfile } from "@/lib/child-profile-context";

const SYMPTOM_LABEL = ["없음", "약간", "보통", "심함", "매우 심함"];

function levelText(v: number) {
  return v >= 1 && v <= 5 ? SYMPTOM_LABEL[v - 1] : String(v);
}

export default function ReportPreviewPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params);
  const { accessToken, loading: authLoading } = useAuth();
  const { childProfile } = useChildProfile();

  const [detail, setDetail] = useState<CaseDetail | null>(null);
  const [diagnoses, setDiagnoses] = useState<DiagnosisWithPrescriptions[]>([]);
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState({ photos: true, graph: true, symptoms: true, prescription: true });
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    (async () => {
      try {
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

  async function handleDownload() {
    setDownloading(true);
    setError("");
    try {
      const chosen = (Object.keys(sections) as ReportSection[]).filter((k) => sections[k]);
      const { blob, filename } = await fetchReportPdf(accessToken, caseId, chosen);

      // 받아온 PDF를 파일로 저장시킨다. 링크를 잠깐 만들어 클릭시킨 뒤 정리한다.
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "리포트를 만들지 못했어요.");
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-full flex-col">
        <ScreenHeader title="진료용 리포트" backHref={`/cases/${caseId}/summary`} />
        <p className="px-5 pt-10 text-center text-sm text-muted">불러오는 중...</p>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex h-full flex-col">
        <ScreenHeader title="진료용 리포트" backHref={`/cases/${caseId}/summary`} />
        <p className="px-5 pt-10 text-center text-sm text-muted">{error || "사례를 찾을 수 없어요."}</p>
      </div>
    );
  }

  const activeCase = detail.case;
  const latestSymptoms = [...detail.photos].reverse().find((p) => p.symptoms)?.symptoms ?? null;

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="진료용 리포트" backHref={`/cases/${caseId}/summary`} />

      <div className="flex-1 space-y-2 overflow-y-auto px-5">
        <p className="pt-1 text-xs text-muted">PDF에 담을 항목을 고르세요.</p>
        <Checkbox checked={sections.photos} onChange={(v) => setSections((s) => ({ ...s, photos: v }))} label="시계열 사진" />
        <Checkbox checked={sections.graph} onChange={(v) => setSections((s) => ({ ...s, graph: v }))} label="면적 변화 그래프" />
        <Checkbox checked={sections.symptoms} onChange={(v) => setSections((s) => ({ ...s, symptoms: v }))} label="증상 기록" />
        <Checkbox checked={sections.prescription} onChange={(v) => setSections((s) => ({ ...s, prescription: v }))} label="진단·처방 이력" />

        <Card className="mt-2 space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div>
              <p className="text-sm font-bold text-foreground">
                {childProfile?.name ?? "아이"} · {activeCase.bodyPart}
              </p>
              <p className="text-xs text-muted">
                관찰 {activeCase.daysObserved}일째 · 기록 {activeCase.photoCount}건
              </p>
            </div>
            <TrendBadge status={activeCase.status} />
          </div>

          {sections.photos && detail.photos.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted">시계열 사진</p>
              <div className="mt-1.5 flex gap-1.5 overflow-x-auto">
                {detail.photos.map((p) => (
                  <PhotoThumb key={p.id} photo={p} className="h-12 w-12 shrink-0 rounded-lg" />
                ))}
              </div>
            </div>
          )}

          {sections.graph && (
            <div>
              <p className="text-xs font-semibold text-muted">면적 변화</p>
              <p className="text-sm text-foreground">
                {activeCase.baselineAreaRatio.toFixed(1)}% → {activeCase.latestAreaRatio.toFixed(1)}%
              </p>
            </div>
          )}

          {sections.symptoms && latestSymptoms && (
            <div>
              <p className="text-xs font-semibold text-muted">최근 증상 기록</p>
              <p className="text-sm text-foreground">
                가려움 {levelText(latestSymptoms.itching)} · 진물 {levelText(latestSymptoms.oozing)} · 통증{" "}
                {levelText(latestSymptoms.pain)} · 체온 {latestSymptoms.fever.toFixed(1)}°C
                {latestSymptoms.newLesion ? " · 신규 병변 있음" : ""}
              </p>
            </div>
          )}

          {sections.prescription && diagnoses.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted">진단·처방</p>
              {diagnoses.map((dx) => (
                <p key={dx.id} className="text-sm text-foreground">
                  {dx.diagnosisName}
                  {dx.prescriptions.length > 0 &&
                    ` · ${dx.prescriptions[0].medicationName} (${dx.prescriptions[0].durationDays}일분)`}
                </p>
              ))}
            </div>
          )}
        </Card>

        <p className="mt-3 text-xs font-medium text-muted">의료진 판단 보조 자료입니다.</p>

        <div className="mt-2">
          <DisclaimerBanner />
        </div>
      </div>

      <div className="px-5 pb-6 pt-3">
        {error && <p className="mb-2 text-center text-sm text-status-caution">{error}</p>}
        <Button fullWidth size="lg" onClick={handleDownload} disabled={downloading}>
          {downloading ? "리포트 만드는 중..." : "PDF로 저장하기"}
        </Button>
      </div>
    </div>
  );
}
