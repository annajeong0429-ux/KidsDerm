"use client";

import { useRouter } from "next/navigation";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Button } from "@/components/ui/Button";
import { useRecordFlow } from "@/lib/record-context";

const ONSET_OPTIONS = ["오늘 처음", "2~3일 전", "1주 전", "2주 이상 전", "잘 모르겠어요", "기타"];
const DISTRIBUTION_OPTIONS = [
  { key: "단일", label: "단일", desc: "한 곳에만" },
  { key: "부분", label: "부분", desc: "몇 군데 흩어져" },
  { key: "광범위", label: "광범위", desc: "넓게 퍼져" },
] as const;

export default function OnsetPage() {
  const router = useRouter();
  const {
    onsetTiming,
    setOnsetTiming,
    onsetTimingDetail,
    setOnsetTimingDetail,
    distribution,
    setDistribution,
  } = useRecordFlow();

  const isOther = onsetTiming === "기타";
  const canProceed = Boolean(onsetTiming) && (!isOther || onsetTimingDetail.trim().length > 0);

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="발병 정보 입력" backHref="/record/symptoms" />

      <div className="flex-1 space-y-6 overflow-y-auto px-6 pt-2">
        <div>
          <p className="text-sm font-medium text-foreground">병변이 언제부터 생겼나요?</p>
          <div className="mt-2 space-y-2">
            {ONSET_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setOnsetTiming(opt)}
                className={`flex h-11 w-full items-center rounded-xl border px-4 text-sm font-medium transition-colors ${
                  onsetTiming === opt ? "border-brand-600 bg-brand-50 text-brand-700" : "border-border text-foreground"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          {isOther && (
            <input
              value={onsetTimingDetail}
              onChange={(e) => setOnsetTimingDetail(e.target.value)}
              placeholder="예: 3주 전 예방접종 이후"
              className="mt-2 h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-brand-500"
            />
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-foreground">병변 분포 범위는 어떤가요?</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {DISTRIBUTION_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setDistribution(opt.key)}
                className={`rounded-xl border px-2 py-3 text-center transition-colors ${
                  distribution === opt.key ? "border-brand-600 bg-brand-50" : "border-border"
                }`}
              >
                <span className={`block text-sm font-bold ${distribution === opt.key ? "text-brand-700" : "text-foreground"}`}>
                  {opt.label}
                </span>
                <span className="mt-0.5 block text-[11px] text-muted">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 pt-3">
        <Button fullWidth size="lg" disabled={!canProceed} onClick={() => router.push("/record/done")}>
          기록 저장하기
        </Button>
      </div>
    </div>
  );
}
