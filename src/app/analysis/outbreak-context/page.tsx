import Link from "next/link";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TrendUpIcon, MapPinIcon } from "@/components/icons";
import { outbreakEntries } from "@/lib/mock-data";

export default function OutbreakContextPage() {
  const relevant = outbreakEntries.filter((o) => o.trend === "증가");

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="지역·시기 유행 정보" backHref="/analysis/result" />

      <div className="flex-1 overflow-y-auto px-6 pt-2">
        <p className="text-sm text-muted">
          분류 결과와 관련된 질환의 우리 지역 신고 추이를 함께 확인해 보세요.
        </p>

        <div className="mt-4 space-y-3">
          {relevant.map((o) => (
            <Card key={o.diseaseName}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">{o.diseaseName}</span>
                <span className="flex items-center gap-1 text-sm font-semibold text-status-caution">
                  <TrendUpIcon className="h-4 w-4" />
                  최근 신고 {o.changeRate}% 증가
                </span>
              </div>
              <p className="mt-1.5 flex items-center gap-1 text-xs text-muted">
                <MapPinIcon className="h-3 w-3" /> {o.region}
              </p>
            </Card>
          ))}
        </div>

        <p className="mt-4 text-xs leading-relaxed text-muted">
          출처: 질병관리청 전수신고 감염병 발생현황 오픈API. 신고 건수 증가는 우리 아이의 실제
          감염 여부를 의미하지 않으며, 감별 우선순위를 조정하는 참고 정보로만 활용됩니다.
        </p>
      </div>

      <div className="px-6 pb-6 pt-3">
        <Link href="/analysis/summary">
          <Button fullWidth size="lg">
            다음
          </Button>
        </Link>
      </div>
    </div>
  );
}
