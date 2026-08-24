import { notFound } from "next/navigation";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Card } from "@/components/ui/Card";
import { TrendBadge } from "@/components/ui/Badge";
import { DisclaimerBanner } from "@/components/ui/Disclaimer";
import { cases, photoRecords } from "@/lib/mock-data";

export default async function ChangeSummaryPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const activeCase = cases.find((c) => c.id === caseId);
  if (!activeCase) notFound();

  const shots = [...photoRecords.filter((p) => p.caseId === caseId)].sort((a, b) => (a.takenAt < b.takenAt ? -1 : 1));
  const latest = shots[shots.length - 1];
  const changeRatio = (activeCase.latestAreaRatio - activeCase.baselineAreaRatio).toFixed(1);

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="변화 요약" backHref={`/cases/${caseId}/chart`} />

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted">관찰 {activeCase.daysObserved}일간 변화</p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {Number(changeRatio) > 0 ? "+" : ""}
              {changeRatio}%p
            </p>
          </div>
          <TrendBadge status={activeCase.status} />
        </Card>

        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <Card>
            <p className="text-xs text-muted">최초 면적 비율</p>
            <p className="mt-1 text-lg font-bold text-foreground">{activeCase.baselineAreaRatio}%</p>
          </Card>
          <Card>
            <p className="text-xs text-muted">최근 면적 비율</p>
            <p className="mt-1 text-lg font-bold text-foreground">{activeCase.latestAreaRatio}%</p>
          </Card>
        </div>

        {latest && (
          <Card className="mt-3">
            <p className="text-xs font-semibold text-muted">최근 기록의 4징후 변화</p>
            <div className="mt-2 grid grid-cols-4 gap-2 text-center">
              {[
                { label: "홍반", value: latest.signs.erythema },
                { label: "구진", value: latest.signs.papulation },
                { label: "긁은 자국", value: latest.signs.excoriation },
                { label: "태선화", value: latest.signs.lichenification },
              ].map((sign) => (
                <div key={sign.label}>
                  <p className="text-[11px] text-muted">{sign.label}</p>
                  <p className="mt-0.5 text-sm font-bold text-foreground">{sign.value}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card className="mt-3">
          <p className="text-sm leading-relaxed text-foreground">
            {activeCase.status === "호전" &&
              "병변 면적과 홍반 정도가 함께 감소했습니다. 현재 처방을 유지하며 관찰하셔도 됩니다."}
            {activeCase.status === "확대 추세" &&
              "병변 면적이 확대되었고 증상도 함께 심해지고 있습니다. 처방 이후의 변화이므로 담당 의료진과의 상담을 고려해 보시기 바랍니다."}
            {activeCase.status === "유지" && "면적과 징후 점수 모두 큰 변화 없이 유지되고 있습니다."}
          </p>
        </Card>

        <div className="mt-3">
          <DisclaimerBanner />
        </div>
      </div>
    </div>
  );
}
