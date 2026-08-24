"use client";

import { useRouter } from "next/navigation";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Button } from "@/components/ui/Button";
import { IntensitySlider } from "@/components/ui/IntensitySlider";
import { Checkbox } from "@/components/ui/Checkbox";
import { useRecordFlow } from "@/lib/record-context";

export default function SymptomsPage() {
  const router = useRouter();
  const { symptoms, setSymptoms } = useRecordFlow();

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="증상 체크리스트" backHref="/record/confirm" />

      <div className="flex-1 space-y-6 overflow-y-auto px-6 pt-2">
        <div className="space-y-5">
          <p className="text-xs font-semibold text-muted">피부 증상</p>
          <IntensitySlider
            label="가려움"
            value={symptoms.itching}
            onChange={(v) => setSymptoms({ ...symptoms, itching: v })}
          />
          <IntensitySlider
            label="진물"
            value={symptoms.oozing}
            onChange={(v) => setSymptoms({ ...symptoms, oozing: v })}
          />
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-xs font-semibold text-muted">전신 증상</p>
            <p className="mt-0.5 text-[11px] text-muted">
              통증·발열 같은 전신 증상을 피부 증상과 함께 보면 질환을 감별하는 데 도움이 돼요.
            </p>
          </div>
          <IntensitySlider
            label="통증"
            value={symptoms.pain}
            onChange={(v) => setSymptoms({ ...symptoms, pain: v })}
          />
          <IntensitySlider
            label="발열"
            value={symptoms.fever}
            onChange={(v) => setSymptoms({ ...symptoms, fever: v })}
          />
        </div>

        <Checkbox
          checked={symptoms.newLesion}
          onChange={(v) => setSymptoms({ ...symptoms, newLesion: v })}
          label="새로운 부위에 병변이 생겼어요"
        />

        <div>
          <label className="text-sm font-medium text-foreground">자유 메모 (선택)</label>
          <textarea
            value={symptoms.memo}
            onChange={(e) => setSymptoms({ ...symptoms, memo: e.target.value })}
            placeholder="예: 어젯밤 유독 많이 긁었어요"
            rows={3}
            className="mt-1.5 w-full resize-none rounded-xl border border-border bg-surface p-3 text-sm outline-none focus:border-brand-500"
          />
        </div>
      </div>

      <div className="px-6 pb-6 pt-3">
        <Button fullWidth size="lg" onClick={() => router.push("/record/onset")}>
          다음
        </Button>
      </div>
    </div>
  );
}
