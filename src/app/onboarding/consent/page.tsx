"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { AlertIcon } from "@/components/icons";

export default function DisclaimerConsentPage() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="flex h-full flex-col px-6 pt-8 pb-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-50">
        <AlertIcon className="h-7 w-7 text-accent-600" />
      </div>
      <h1 className="mt-4 text-xl font-bold text-foreground">
        키즈덤AI는 진단 도구가 아니에요
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        시작하기 전, 이 서비스의 역할을 정확히 안내해 드릴게요.
      </p>

      <div className="mt-6 flex-1 space-y-3 overflow-y-auto rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-foreground">
        <p>
          키즈덤AI가 제공하는 병변 분석, 중증도 수치, 시계열 변화, 지역 유행 정보는{" "}
          <strong>의학적 진단이 아니며 참고용 정보</strong>입니다.
        </p>
        <p>
          분류 결과는 확정 진단이 아닌 <strong>감별 대상 후보 목록</strong>으로 제시되며,
          아이의 상태에 대한 최종 판단과 치료는 반드시{" "}
          <strong>의료진의 진료를 통해서만</strong> 이루어져야 합니다.
        </p>
        <p>
          정보가 애매하거나 확신도가 낮은 경우, 키즈덤AI는 항상 &ldquo;괜찮음&rdquo;이 아닌{" "}
          <strong>&ldquo;병원 방문 고려&rdquo;</strong> 쪽으로 안내합니다. 이는 안전을 최우선하는
          설계 원칙입니다.
        </p>
      </div>

      <div className="mt-4">
        <Checkbox
          checked={agreed}
          onChange={setAgreed}
          label="위 내용을 확인했으며 동의합니다"
          required
        />
      </div>

      <div className="mt-4">
        <Button
          fullWidth
          size="lg"
          disabled={!agreed}
          onClick={() => router.push("/login")}
        >
          동의하고 계속하기
        </Button>
      </div>
    </div>
  );
}
