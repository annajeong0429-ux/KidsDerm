"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Button } from "@/components/ui/Button";
import { useMedicalFlow } from "@/lib/medical-context";
import { useAuth } from "@/lib/auth-context";
import { useChildProfile } from "@/lib/child-profile-context";
import { listCases, type CaseSummary } from "@/lib/api";

const COMMON_DIAGNOSES = ["아토피피부염", "접촉성 피부염", "농가진", "수족구병", "건선"];

export default function DiagnosisInputPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const { childProfile } = useChildProfile();
  const { caseId, setCaseId, visitDate, setVisitDate, diagnosisName, setDiagnosisName, hospitalName, setHospitalName } =
    useMedicalFlow();
  const [cases, setCases] = useState<CaseSummary[]>([]);

  useEffect(() => {
    if (!childProfile) return;
    let cancelled = false;
    listCases(accessToken, childProfile.id)
      .then((list) => {
        if (cancelled) return;
        setCases(list);
        // 사례가 하나뿐이면 고를 것도 없으니 자동으로 선택해 둔다.
        if (list.length > 0) setCaseId((current) => (current ? current : list[0].id));
      })
      .catch(() => {
        if (!cancelled) setCases([]);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, childProfile, setCaseId]);

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="진단 정보 입력" backHref="/analysis/next-visit" />

      <div className="flex-1 space-y-5 overflow-y-auto px-6 pt-2">
        <p className="text-sm leading-relaxed text-muted">
          영수증이나 진단 서류를 참고해 내용을 입력해 주세요.
        </p>

        <div>
          <label className="text-sm font-medium text-foreground">어느 부위에 대한 진료인가요?</label>
          <select
            value={caseId}
            onChange={(e) => setCaseId(e.target.value)}
            className="mt-1.5 h-12 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-brand-500"
          >
            {cases.length === 0 && <option value="">관찰 중인 사례가 없어요</option>}
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.bodyPart} (시작 {c.createdAt})
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-muted">
            진단·처방은 여기서 고른 사례의 경과 기준점으로 기록돼요.
          </p>
        </div>

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
          disabled={!visitDate || !diagnosisName || !caseId}
          onClick={() => router.push("/medical/prescription")}
        >
          다음: 처방 정보 입력
        </Button>
      </div>
    </div>
  );
}
