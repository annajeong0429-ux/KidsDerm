"use client";

import { useRouter } from "next/navigation";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Button } from "@/components/ui/Button";
import { useMedicalFlow } from "@/lib/medical-context";

export default function FollowupSchedulePage() {
  const router = useRouter();
  const { nextVisitDate, setNextVisitDate, reminderCycleDays, setReminderCycleDays, reminderOn, setReminderOn } =
    useMedicalFlow();

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="재진 예정일 설정" backHref="/medical/prescription" />

      <div className="flex-1 space-y-6 overflow-y-auto px-6 pt-2">
        <div>
          <label className="text-sm font-medium text-foreground">재진 예정일</label>
          <input
            type="date"
            value={nextVisitDate}
            onChange={(e) => setNextVisitDate(e.target.value)}
            className="mt-1.5 h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <span className="text-sm font-medium text-foreground">촬영 리마인더 주기</span>
          <div className="mt-1.5 grid grid-cols-3 gap-2">
            {([1, 2, 3] as const).map((d) => (
              <button
                key={d}
                onClick={() => setReminderCycleDays(d)}
                className={`h-11 rounded-xl border text-sm font-semibold transition-colors ${
                  reminderCycleDays === d ? "border-brand-600 bg-brand-50 text-brand-700" : "border-border text-muted"
                }`}
              >
                {d}일마다
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setReminderOn(!reminderOn)}
          className="flex w-full items-center justify-between rounded-xl border border-border bg-surface px-4 py-3.5"
        >
          <span className="text-sm font-medium text-foreground">촬영 알림 받기</span>
          <span className={`relative h-6 w-11 rounded-full transition-colors ${reminderOn ? "bg-brand-600" : "bg-border"}`}>
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${reminderOn ? "translate-x-5" : "translate-x-0.5"}`}
            />
          </span>
        </button>

        <p className="text-xs leading-relaxed text-muted">
          이 진단·처방 기록이 경과 관찰의 기준점(baseline)이 됩니다. 이후 촬영 기록은 이 시점을
          기준으로 &ldquo;처방 후 호전/악화&rdquo;로 비교돼요.
        </p>
      </div>

      <div className="px-6 pb-6 pt-3">
        <Button fullWidth size="lg" disabled={!nextVisitDate} onClick={() => router.push("/cases/case-1/timeline")}>
          저장하고 경과 보기
        </Button>
      </div>
    </div>
  );
}
