import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { TrendBadge } from "@/components/ui/Badge";
import { CameraIcon, CalendarIcon } from "@/components/icons";
import { cases, diagnoses, photoRecords } from "@/lib/mock-data";
import { notFound } from "next/navigation";

export default async function CaseTimelinePage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const activeCase = cases.find((c) => c.id === caseId);
  if (!activeCase) notFound();

  type Event =
    | { type: "photo"; date: string; data: (typeof photoRecords)[number] }
    | { type: "diagnosis"; date: string; data: (typeof diagnoses)[number] };

  const events: Event[] = [
    ...photoRecords.filter((p) => p.caseId === caseId).map((p) => ({ type: "photo" as const, date: p.takenAt, data: p })),
    ...diagnoses.filter((d) => d.caseId === caseId).map((d) => ({ type: "diagnosis" as const, date: d.date, data: d })),
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
                  <span className="h-12 w-12 shrink-0 rounded-lg" style={{ backgroundColor: event.data.imageColor }} />
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
      </div>
    </div>
  );
}
