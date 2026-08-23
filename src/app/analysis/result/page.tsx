import Link from "next/link";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { classificationResult } from "@/lib/mock-data";

export default function ClassificationResultPage() {
  const top = classificationResult[0];
  const lowConfidence = top.probability < 0.6;

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="1차 분류 결과" backHref="/record/done" />

      <div className="flex-1 overflow-y-auto px-6 pt-2">
        <p className="text-sm text-muted">
          사진과 기록을 바탕으로, 가능성이 있는 질환을 확률 순으로 보여드려요.
        </p>

        {lowConfidence && (
          <div className="mt-3">
            <Pill tone="accent">신뢰도 낮음 · 참고용으로만 확인해 주세요</Pill>
          </div>
        )}

        <Card className="mt-4">
          <p className="mb-3 text-xs font-semibold text-muted">가능성 있는 질환 (상위 3개)</p>
          <div className="space-y-3.5">
            {classificationResult.map((c, i) => (
              <div key={c.name}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {i === 0 && <span className="mr-1.5 text-brand-600">●</span>}
                    {c.name}
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {Math.round(c.probability * 100)}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-canvas">
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{ width: `${c.probability * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <p className="mt-4 text-xs leading-relaxed text-muted">
          위 목록은 확정 진단이 아닌 감별 대상 후보이며, 사진과 증상 기록을 바탕으로 산출된
          참고 정보입니다. 실제 진단은 의료진의 진료를 통해 이루어집니다.
        </p>
      </div>

      <div className="px-6 pb-6 pt-3">
        <Link href="/analysis/severity">
          <Button fullWidth size="lg">
            다음
          </Button>
        </Link>
      </div>
    </div>
  );
}
