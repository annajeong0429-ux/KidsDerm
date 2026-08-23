import Link from "next/link";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Card } from "@/components/ui/Card";
import { cases, diagnoses, prescriptions } from "@/lib/mock-data";

export default async function HistoryListPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const activeCase = cases.find((c) => c.id === caseId);
  const caseDiagnoses = diagnoses.filter((d) => d.caseId === caseId);

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="진료 이력" backHref={`/cases/${caseId}/timeline`} />

      <div className="flex-1 space-y-2.5 overflow-y-auto px-6 pt-2">
        {activeCase && <p className="pb-1 text-xs text-muted">{activeCase.bodyPart}</p>}
        {caseDiagnoses.map((dx) => {
          const rx = prescriptions.find((p) => p.diagnosisId === dx.id);
          return (
            <Link key={dx.id} href={`/cases/${caseId}/history/${dx.id}`}>
              <Card>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-foreground">{dx.diagnosisName}</p>
                  <p className="text-xs text-muted">{dx.date}</p>
                </div>
                <p className="mt-1 text-xs text-muted">{dx.hospitalName}</p>
                {rx && <p className="mt-1.5 text-xs text-foreground">{rx.medicationName} · {rx.durationDays}일분</p>}
              </Card>
            </Link>
          );
        })}
        {caseDiagnoses.length === 0 && (
          <p className="pt-10 text-center text-sm text-muted">아직 등록된 진료 이력이 없어요</p>
        )}
      </div>
    </div>
  );
}
