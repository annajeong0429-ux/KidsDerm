"use client";

import { useRouter } from "next/navigation";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Button } from "@/components/ui/Button";
import { useMedicalFlow } from "@/lib/medical-context";

export default function PrescriptionInputPage() {
  const router = useRouter();
  const { medicationName, setMedicationName, form, setForm, durationDays, setDurationDays, note, setNote } =
    useMedicalFlow();

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="처방 정보 입력" backHref="/medical/diagnosis" />

      <div className="flex-1 space-y-5 overflow-y-auto px-6 pt-2">
        <div>
          <label className="text-sm font-medium text-foreground">약제명</label>
          <input
            value={medicationName}
            onChange={(e) => setMedicationName(e.target.value)}
            placeholder="예: 타크로리무스 연고"
            className="mt-1.5 h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <span className="text-sm font-medium text-foreground">제형</span>
          <div className="mt-1.5 grid grid-cols-3 gap-2">
            {(["연고", "경구", "기타"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setForm(f)}
                className={`h-11 rounded-xl border text-sm font-semibold transition-colors ${
                  form === f ? "border-brand-600 bg-brand-50 text-brand-700" : "border-border text-muted"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">사용 기간 (일)</label>
          <input
            type="number"
            min={1}
            value={durationDays}
            onChange={(e) => setDurationDays(Number(e.target.value))}
            className="mt-1.5 h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">주의사항 메모 (선택)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="예: 하루 2회, 얇게 도포"
            rows={3}
            className="mt-1.5 w-full resize-none rounded-xl border border-border bg-surface p-3 text-sm outline-none focus:border-brand-500"
          />
        </div>
      </div>

      <div className="px-6 pb-6 pt-3">
        <Button fullWidth size="lg" disabled={!medicationName} onClick={() => router.push("/medical/followup")}>
          다음: 재진 예정일 설정
        </Button>
      </div>
    </div>
  );
}
