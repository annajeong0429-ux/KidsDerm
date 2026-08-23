"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { ChevronRightIcon, CheckIcon } from "@/components/icons";
import { useSignupFlow } from "@/lib/signup-context";
import { ApiError, useAuth } from "@/lib/auth-context";

type ConsentKey = "service" | "location" | "privacy" | "health" | "marketing";

interface ConsentDef {
  key: ConsentKey;
  title: string;
  required: boolean;
  summary: string;
  body: string[];
}

const CONSENTS: ConsentDef[] = [
  {
    key: "service",
    title: "서비스 이용약관 동의",
    required: true,
    summary: "서비스 이용 조건에 대한 약관입니다",
    body: [
      "제1조 (목적) 이 약관은 키즈덤AI(이하 \"회사\")가 제공하는 소아 피부질환 경과 관찰 보조 서비스(이하 \"서비스\")의 이용조건 및 절차, 회사와 이용자의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.",
      "제2조 (서비스의 성격과 한계) 서비스가 제공하는 병변 분석, 중증도 수치, 시계열 변화 등 모든 정보는 의학적 진단이 아닌 참고용 정보이며, 확정 진단 및 치료는 반드시 의료진의 진료를 통해서만 이루어져야 합니다.",
      "제3조 (이용자의 의무) 이용자는 본인 또는 법정대리인 자격으로 아동의 정보를 등록해야 하며, 타인의 정보를 무단으로 등록해서는 안 됩니다.",
      "제4조 (계정 관리) 이용자는 이메일·비밀번호 등 계정 정보를 안전하게 관리할 책임이 있으며, 제3자에 의한 부정 이용에 대해 회사는 고의 또는 중과실이 없는 한 책임을 지지 않습니다.",
    ],
  },
  {
    key: "location",
    title: "위치기반 서비스 이용약관 동의",
    required: true,
    summary: "거주 지역 기반 지역 유행 정보 제공을 위한 약관입니다",
    body: [
      "제1조 (목적) 이 약관은 이용자가 등록한 거주 지역(시/도, 시/군/구) 정보를 활용하여 지역·시기별 감염병 유행 정보를 제공하는 위치기반서비스 이용에 관한 사항을 규정합니다.",
      "제2조 (수집하는 위치정보의 범위) 회사는 GPS 등 실시간 정밀 위치가 아닌, 이용자가 직접 입력한 시/도 및 시/군/구 단위의 대략적 거주 지역 정보만을 수집합니다.",
      "제3조 (이용 목적) 수집된 지역 정보는 질병관리청 공공데이터(전수신고 감염병 발생현황 등)와 결합하여, 해당 지역·시기의 감염병 신고 추이를 안내하는 목적으로만 사용됩니다.",
      "제4조 (제3자 제공) 회사는 이용자의 위치정보를 본인의 동의 없이 제3자에게 제공하지 않으며, 공공데이터 조회는 이용자를 식별할 수 없는 지역 단위로만 이루어집니다.",
    ],
  },
  {
    key: "privacy",
    title: "개인정보 처리방침 동의",
    required: true,
    summary: "개인정보 수집·이용·보관에 대한 방침입니다",
    body: [
      "1. 수집하는 개인정보 항목 — 회원가입 시 이메일·비밀번호를, 아이 프로필 등록 시 아이의 이름·생년월일·성별·거주 지역을 수집합니다.",
      "2. 개인정보의 이용 목적 — 수집된 정보는 회원 식별, 서비스 제공(병변 분석·경과 추적·지역 유행 정보 제공), 고객 문의 응대 목적으로만 이용됩니다.",
      "3. 보유 및 이용 기간 — 회원 탈퇴 시 관련 법령에 따른 보관 의무가 있는 경우를 제외하고 지체 없이 파기합니다.",
      "4. 이용자의 권리 — 이용자는 언제든지 본인의 개인정보 열람·정정·삭제·처리정지를 요청할 수 있습니다.",
    ],
  },
  {
    key: "health",
    title: "민감정보(건강정보) 수집·이용 동의",
    required: true,
    summary:
      "아이의 피부 사진과 증상 기록은 건강 관련 민감정보로 분류되어 별도 동의가 필요합니다. 경과 관찰 목적 외에는 사용하지 않습니다.",
    body: [
      "1. 수집 항목 — 아이의 피부 병변 사진, 증상 체크리스트(가려움·진물·통증·발열 등), 진단명, 처방 내용(약제명·용법·기간)을 수집합니다.",
      "2. 이용 목적 — 병변 면적 및 중증도(홍반·구진·긁은 자국·태선화) 정량화, 시점 간 변화 비교(호전·유지·확대 추세 판정), 진료 시 참고할 요약 리포트 생성 목적으로만 이용됩니다.",
      "3. 보유 기간 — 회원 탈퇴 또는 동의 철회 시 지체 없이 파기합니다. 단, 통계 작성 목적으로 익명화된 형태로만 일부 보관될 수 있습니다.",
      "4. 동의 거부 권리 — 민감정보 수집에 동의하지 않을 경우 서비스의 핵심 기능(병변 분석, 경과 추적)을 이용할 수 없습니다.",
    ],
  },
  {
    key: "marketing",
    title: "마케팅 정보 활용 동의",
    required: false,
    summary: "새로운 기능 안내와 육아 정보를 이메일로 받아볼 수 있어요",
    body: [
      "1. 수집 및 이용 목적 — 신규 기능 안내, 이벤트·프로모션 정보, 육아 및 소아 피부건강 관련 콘텐츠를 이메일 또는 앱 내 알림으로 안내하기 위해 활용됩니다.",
      "2. 동의의 임의성 — 본 동의는 선택 사항이며, 동의하지 않아도 서비스 이용에 제한이 없습니다.",
      "3. 철회 방법 — 설정 > 알림 설정에서 언제든지 수신 동의를 철회할 수 있습니다.",
    ],
  },
];

type AgreementState = Record<ConsentKey, boolean>;

const INITIAL_STATE: AgreementState = {
  service: false,
  location: false,
  privacy: false,
  health: false,
  marketing: false,
};

function ConsentItem({
  consent,
  checked,
  expanded,
  onToggleCheck,
  onToggleExpand,
}: {
  consent: ConsentDef;
  checked: boolean;
  expanded: boolean;
  onToggleCheck: () => void;
  onToggleExpand: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex items-start gap-3 px-3.5 py-3">
        <button
          type="button"
          onClick={onToggleCheck}
          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors"
          style={{
            borderColor: checked ? "var(--color-brand-600)" : "var(--color-border)",
            backgroundColor: checked ? "var(--color-brand-600)" : "white",
          }}
          aria-label={`${consent.title} 동의`}
        >
          {checked && <CheckIcon className="h-3.5 w-3.5 text-white" />}
        </button>

        <button type="button" onClick={onToggleExpand} className="flex flex-1 items-start gap-2 text-left">
          <span className="flex-1">
            <span className="text-sm font-medium text-foreground">
              {consent.title}
              <span className={`ml-1 ${consent.required ? "text-accent-600" : "text-muted"}`}>
                ({consent.required ? "필수" : "선택"})
              </span>
            </span>
            <span className="mt-0.5 block text-xs text-muted">{consent.summary}</span>
          </span>
          <ChevronRightIcon
            className={`mt-0.5 h-4 w-4 shrink-0 text-muted transition-transform ${expanded ? "rotate-90" : ""}`}
          />
        </button>
      </div>

      {expanded && (
        <div className="space-y-2 border-t border-border bg-canvas px-3.5 py-3 text-xs leading-relaxed text-muted">
          {consent.body.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TermsAgreementPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const { email, password } = useSignupFlow();
  const [agreements, setAgreements] = useState<AgreementState>(INITIAL_STATE);
  const [expandedKey, setExpandedKey] = useState<ConsentKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const requiredKeys = CONSENTS.filter((c) => c.required).map((c) => c.key);
  const allRequiredChecked = requiredKeys.every((k) => agreements[k]);
  const allChecked = CONSENTS.every((c) => agreements[c.key]);

  function toggleAll(next: boolean) {
    setAgreements(Object.fromEntries(CONSENTS.map((c) => [c.key, next])) as AgreementState);
  }

  async function handleAgree() {
    if (!email || !password) {
      router.replace("/signup");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      // 화면에는 5개 항목으로 나눠 보여주지만, 서버는 "이용약관류(서비스·위치기반·개인정보)/
      // 민감정보/마케팅" 3개 카테고리로만 동의 시각을 기록한다 - services/auth.py 참고.
      await signup(email, password, {
        termsAgreed: agreements.service && agreements.location && agreements.privacy,
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

      <div className="flex-1 space-y-2.5 overflow-y-auto px-6 pt-2 pb-4">
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

        {CONSENTS.map((consent) => (
          <ConsentItem
            key={consent.key}
            consent={consent}
            checked={agreements[consent.key]}
            expanded={expandedKey === consent.key}
            onToggleCheck={() => setAgreements((a) => ({ ...a, [consent.key]: !a[consent.key] }))}
            onToggleExpand={() => setExpandedKey((k) => (k === consent.key ? null : consent.key))}
          />
        ))}

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
