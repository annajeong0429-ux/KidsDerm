"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { TrendBadge } from "@/components/ui/Badge";
import { DisclaimerBanner } from "@/components/ui/Disclaimer";
import { cases, diagnoses, photoRecords, prescriptions } from "@/lib/mock-data";
import { useChildProfile } from "@/lib/child-profile-context";

export default function ReportPreviewPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params);
  const { childProfile } = useChildProfile();
  const activeCase = cases.find((c) => c.id === caseId)!;
  const dx = diagnoses.find((d) => d.caseId === caseId);
  const rx = prescriptions.find((p) => p.diagnosisId === dx?.id);
  const shots = photoRecords.filter((p) => p.caseId === caseId);

  const [sections, setSections] = useState({ photos: true, graph: true, symptoms: true, prescription: true });

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="진료용 리포트 미리보기" backHref={`/cases/${caseId}/summary`} />

      <div className="flex-1 space-y-2 overflow-y-auto px-5">
        <Checkbox checked={sections.photos} onChange={(v) => setSections((s) => ({ ...s, photos: v }))} label="시계열 사진" />
        <Checkbox checked={sections.graph} onChange={(v) => setSections((s) => ({ ...s, graph: v }))} label="면적 변화 그래프" />
        <Checkbox checked={sections.symptoms} onChange={(v) => setSections((s) => ({ ...s, symptoms: v }))} label="증상 기록" />
        <Checkbox checked={sections.prescription} onChange={(v) => setSections((s) => ({ ...s, prescription: v }))} label="진단·처방 이력" />

        <Card className="mt-2 space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div>
              <p className="text-sm font-bold text-foreground">{childProfile.name} · {activeCase.bodyPart}</p>
              <p className="text-xs text-muted">관찰 {activeCase.daysObserved}일째</p>
            </div>
            <TrendBadge status={activeCase.status} />
          </div>

          {sections.photos && (
            <div>
              <p className="text-xs font-semibold text-muted">시계열 사진</p>
              <div className="mt-1.5 flex gap-1.5">
                {shots.map((s) => (
                  <span key={s.id} className="h-12 w-12 rounded-lg" style={{ backgroundColor: s.imageColor }} />
                ))}
              </div>
            </div>
          )}

          {sections.graph && (
            <div>
              <p className="text-xs font-semibold text-muted">면적 변화</p>
              <p className="text-sm text-foreground">
                {activeCase.baselineAreaRatio}% → {activeCase.latestAreaRatio}%
              </p>
            </div>
          )}

          {sections.symptoms && (
            <div>
              <p className="text-xs font-semibold text-muted">증상 기록</p>
              <p className="text-sm text-foreground">가려움 보통, 진물 약함, 신규 병변 없음</p>
            </div>
          )}

          {sections.prescription && dx && rx && (
            <div>
              <p className="text-xs font-semibold text-muted">진단·처방</p>
              <p className="text-sm text-foreground">
                {dx.diagnosisName} · {rx.medicationName} ({rx.durationDays}일분)
              </p>
            </div>
          )}
        </Card>

        <p className="mt-3 text-xs font-medium text-muted">의료진 판단 보조 자료입니다.</p>

        <div className="mt-2">
          <DisclaimerBanner />
        </div>
      </div>

      <div className="px-5 pb-6 pt-3">
        <Link href={`/cases/${caseId}/report/share`}>
          <Button fullWidth size="lg">
            리포트 공유·저장하기
          </Button>
        </Link>
      </div>
    </div>
  );
}
