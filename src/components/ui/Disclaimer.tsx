import { InfoIcon } from "@/components/icons";

export function DisclaimerBanner({
  text = "본 정보는 의학적 진단이 아니며 최종 판단은 의료진의 진료를 통해 이루어집니다.",
  compact = false,
}: {
  text?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-2 rounded-xl bg-brand-50 text-brand-800 ${compact ? "px-3 py-2" : "px-3.5 py-3"}`}
    >
      <InfoIcon className="h-4 w-4 mt-0.5 shrink-0" />
      <p className="text-xs leading-relaxed">{text}</p>
    </div>
  );
}
