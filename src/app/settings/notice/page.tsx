import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { DisclaimerBanner } from "@/components/ui/Disclaimer";

const LIMITS = [
  {
    title: "진단 도구가 아닙니다",
    body: "키즈덤AI가 제공하는 모든 결과는 확정 진단이 아닌 참고 정보이며, 감별 대상 후보 목록 형태로 제시됩니다. 최종 판단과 치료는 반드시 의료진의 진료를 통해 이루어져야 합니다.",
  },
  {
    title: "보수적으로 정보를 제시합니다",
    body: "시계열 판정이나 분류 결과가 애매하거나 확신도가 낮은 경우, 항상 '괜찮음'이 아닌 '병원 방문 고려' 쪽 정보를 우선 제시합니다.",
  },
  {
    title: "적용 범위의 한계",
    body: "병변 면적 정량화는 세그멘테이션 라벨이 제공되는 질환군(아토피피부염 등)에 한정됩니다. 감염성 질환군은 분류와 지역 유행 정보 제공까지로 범위가 제한됩니다.",
  },
  {
    title: "촬영 환경에 따른 편차",
    body: "가정에서 스마트폰으로 촬영한 사진은 조명·거리·각도에 따라 분석 정확도가 달라질 수 있습니다. 피부 영역이 충분히 검출되지 않으면 재촬영을 요청합니다.",
  },
];

export default function ServiceNoticePage() {
  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="서비스 고지사항" backHref="/settings" />

      <div className="flex-1 space-y-4 overflow-y-auto px-6 pt-2 pb-6">
        <DisclaimerBanner text="본 결과는 의학적 진단을 대체하지 않으며, 참고용 정보입니다." />

        {LIMITS.map((item) => (
          <div key={item.title}>
            <p className="text-sm font-bold text-foreground">{item.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
