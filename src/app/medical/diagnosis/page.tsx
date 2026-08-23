"use client";

import { useRouter } from "next/navigation";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Button } from "@/components/ui/Button";
import { useMedicalFlow } from "@/lib/medical-context";

const COMMON_DIAGNOSES = ["아토피피부염", "접촉성 피부염", "농가진", "수족구병", "건선"];

export default function DiagnosisInputPage() {
  const router = useRouter();
  const { visitDate, setVisitDate, diagnosisName, setDiagnosisName, hospitalName, setHospitalName } =
    useMedicalFlow();

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="진단 정보 입력" backHref="/analysis/next-visit" />

      <div className="flex-1 space-y-5 overflow-y-auto px-6 pt-2">
        <p className="text-sm leading-relaxed text-muted">
          영수증이나 진단 서류를 참고해 내용을 입력해 주세요.
        </p>

        <div>
          <label className="text-sm font-medium text-foreground">진료일</label>
          <input
            type="date"
            value={visitDate}
            onChange={(e) => setVisitDate(e.target.value)}
            className="mt-1.5 h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">진단명</label>
          <input
            list="diagnosis-options"
            value={diagnosisName}
            onChange={(e) => setDiagnosisName(e.target.value)}
            placeholder="검색하거나 직접 입력해 주세요"
            className="mt-1.5 h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-brand-500"
          />
          <datalist id="diagnosis-options">
            {COMMON_DIAGNOSES.map((d) => (
              <option key={d} value={d} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">병원명</label>
          <input
            value={hospitalName}
            onChange={(e) => setHospitalName(e.target.value)}
            placeholder="예: 새싹소아청소년과"
            className="mt-1.5 h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-brand-500"
          />
        </div>

        <p className="text-xs text-muted">
          1차 분류 결과와 다른 경우 부모가 직접 입력할 수 있어요. 진단은 언제나 의료진의 몫입니다.
        </p>
      </div>

      <div className="px-6 pb-6 pt-3">
        <Button
          fullWidth
          size="lg"
          disabled={!visitDate || !diagnosisName}
          onClick={() => router.push("/medical/prescription")}
        >
          다음: 처방 정보 입력
        </Button>
      </div>
    </div>
  );
}
