import Link from "next/link";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Button } from "@/components/ui/Button";
import { DisclaimerBanner } from "@/components/ui/Disclaimer";
import { AlertIcon } from "@/components/icons";

export default function AnalysisDisclaimerPage() {
  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="안내 사항" backHref="/analysis/summary" />

      <div className="flex-1 px-6 pt-2">
        <DisclaimerBanner text="본 정보는 의학적 진단이 아니며 최종 판단은 의료진의 진료를 통해 이루어집니다." />

        <div className="mt-4 space-y-3 rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-foreground">
          <p>
            방금 확인한 분류 결과와 종합 참고 정보는 <strong>확정 진단이 아닙니다.</strong> 사진과
            증상 기록을 바탕으로 산출된 감별 대상 후보이며, 실제 진단과 치료 방향은 반드시{" "}
            <strong>의료진의 진료</strong>를 통해 결정되어야 합니다.
          </p>
          <p>
            애매하거나 확신도가 낮은 경우 키즈덤AI는 항상 병원 방문을 고려하는 쪽으로 안내합니다.
            아이의 상태가 걱정된다면 이 정보와 관계없이 병원에 방문해 주세요.
          </p>
        </div>

        <Link
          href="/settings/notice"
          className="mt-3 flex items-center justify-center gap-1 text-xs font-medium text-brand-700"
        >
          <AlertIcon className="h-3.5 w-3.5" /> 서비스 고지사항 전문 보기
        </Link>
      </div>

      <div className="px-6 pb-6 pt-3">
        <Link href="/analysis/next-visit">
          <Button fullWidth size="lg">
            확인했어요
          </Button>
        </Link>
      </div>
    </div>
  );
}
