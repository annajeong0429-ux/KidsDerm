import Link from "next/link";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Card } from "@/components/ui/Card";
import { diagnoses, photoRecords, prescriptions } from "@/lib/mock-data";

export default async function HistoryDetailPage({
  params,
}: {
  params: Promise<{ caseId: string; recordId: string }>;
}) {
  const { caseId, recordId } = await params;
  const dx = diagnoses.find((d) => d.id === recordId);
  const rx = prescriptions.find((p) => p.diagnosisId === recordId);
  const relatedPhoto = photoRecords.find((p) => p.caseId === caseId);

  if (!dx) {
    return (
      <div className="flex h-full flex-col">
        <ScreenHeader title="진료 상세" backHref={`/cases/${caseId}/history`} />
        <p className="px-6 pt-10 text-center text-sm text-muted">기록을 찾을 수 없어요</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="진료 상세" backHref={`/cases/${caseId}/history`} />

      <div className="flex-1 space-y-4 overflow-y-auto px-6 pt-2">
        <Card>
          <p className="text-xs font-semibold text-muted">진단 정보</p>
          <dl className="mt-2 space-y-1.5 text-sm">
            <div className="flex justify-between"><dt className="text-muted">진료일</dt><dd className="text-foreground">{dx.date}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">병원</dt><dd className="text-foreground">{dx.hospitalName}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">진단명</dt><dd className="font-semibold text-foreground">{dx.diagnosisName}</dd></div>
          </dl>
        </Card>

        {rx && (
          <Card>
            <p className="text-xs font-semibold text-muted">처방 정보</p>
            <dl className="mt-2 space-y-1.5 text-sm">
              <div className="flex justify-between"><dt className="text-muted">약제명</dt><dd className="text-foreground">{rx.medicationName}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">제형</dt><dd className="text-foreground">{rx.form}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">사용 기간</dt><dd className="text-foreground">{rx.durationDays}일</dd></div>
              <div className="flex justify-between"><dt className="text-muted">재진 예정일</dt><dd className="text-foreground">{rx.nextVisitDate}</dd></div>
              {rx.note && <div className="flex justify-between"><dt className="text-muted">메모</dt><dd className="text-foreground">{rx.note}</dd></div>}
            </dl>
          </Card>
        )}

        {relatedPhoto && (
          <Link href={`/cases/${caseId}/timeline`} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
            <span className="h-14 w-14 shrink-0 rounded-lg" style={{ backgroundColor: relatedPhoto.imageColor }} />
            <span className="text-xs text-brand-700 underline underline-offset-2">이 시점 관련 사진 기록 보기</span>
          </Link>
        )}

        <div className="flex gap-2 pt-1">
          <button className="h-10 flex-1 rounded-xl border border-border text-sm font-medium text-foreground">수정</button>
          <button className="h-10 flex-1 rounded-xl border border-border text-sm font-medium text-accent-600">삭제</button>
        </div>
      </div>
    </div>
  );
}
