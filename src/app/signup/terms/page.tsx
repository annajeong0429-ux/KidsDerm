"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { useSignupFlow } from "@/lib/signup-context";
import { ApiError, useAuth } from "@/lib/auth-context";

export default function TermsAgreementPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const { email, password } = useSignupFlow();
  const [agreements, setAgreements] = useState({
    service: false,
    health: false,
    marketing: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const allRequiredChecked = agreements.service && agreements.health;
  const allChecked = agreements.service && agreements.health && agreements.marketing;

  function toggleAll(next: boolean) {
    setAgreements({ service: next, health: next, marketing: next });
  }

  async function handleAgree() {
    if (!email || !password) {
      router.replace("/signup");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await signup(email, password, {
        termsAgreed: agreements.service,
        healthInfoAgreed: agreements.health,
        marketingAgreed: agreements.marketing,
      });
      router.push("/profile/new");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.detail : "회원가입에 실패했어요. 잠시 후 다시 시도해 주세요."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="약관 및 개인정보 동의" backHref="/signup" />

      <div className="flex-1 space-y-3 px-6 pt-2">
        <button
          type="button"
          onClick={() => toggleAll(!allChecked)}
          className="flex w-full items-center gap-2 rounded-xl bg-brand-50 px-3.5 py-3 text-sm font-semibold text-brand-800"
        >
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-full border ${allChecked ? "border-brand-600 bg-brand-600" : "border-brand-300 bg-white"}`}
          >
            {allChecked && <span className="h-2 w-2 rounded-full bg-white" />}
          </span>
          전체 동의합니다
        </button>

        <Checkbox
          checked={agreements.service}
          onChange={(v) => setAgreements((a) => ({ ...a, service: v }))}
          label="이용약관 동의"
          description="서비스 이용 조건에 대한 약관입니다"
          required
        />
        <Checkbox
          checked={agreements.health}
          onChange={(v) => setAgreements((a) => ({ ...a, health: v }))}
          label="민감정보(건강정보) 수집·이용 동의"
          description="아이의 피부 사진과 증상 기록은 건강 관련 민감정보로 분류되어 별도 동의가 필요합니다. 경과 관찰 목적 외에는 사용하지 않습니다."
          required
        />
        <Checkbox
          checked={agreements.marketing}
          onChange={(v) => setAgreements((a) => ({ ...a, marketing: v }))}
          label="마케팅 정보 수신 동의 (선택)"
          description="새로운 기능 안내와 육아 정보를 이메일로 받아볼 수 있어요"
        />

        <button type="button" className="pt-1 text-xs font-medium text-muted underline underline-offset-2">
          약관 전문 보기
        </button>

        {error && <p className="text-xs font-medium text-accent-600">{error}</p>}
      </div>

      <div className="px-6 pb-6">
        <Button fullWidth size="lg" disabled={!allRequiredChecked || submitting} onClick={handleAgree}>
          {submitting ? "가입 처리 중..." : "동의하고 계속하기"}
        </Button>
      </div>
    </div>
  );
}
