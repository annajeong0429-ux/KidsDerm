"use client";

import { useState } from "react";
import { ScreenHeader } from "@/components/layout/ScreenHeader";

const DOCS = [
  { key: "service", label: "이용약관" },
  { key: "privacy", label: "개인정보 처리방침" },
] as const;

export default function TermsDocumentPage() {
  const [active, setActive] = useState<(typeof DOCS)[number]["key"]>("service");

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="약관 및 개인정보 처리방침" backHref="/settings" />

      <div className="flex gap-2 px-5 pb-2">
        {DOCS.map((doc) => (
          <button
            key={doc.key}
            onClick={() => setActive(doc.key)}
            className={`h-8 rounded-full px-3.5 text-xs font-semibold ${
              active === doc.key ? "bg-brand-600 text-white" : "border border-border text-muted"
            }`}
          >
            {doc.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <div className="space-y-3 rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-foreground">
          {active === "service" ? (
            <>
              <p className="font-semibold">제1조 (목적)</p>
              <p>
                이 약관은 키즈덤AI(이하 &ldquo;서비스&rdquo;)의 이용 조건 및 절차, 이용자와
                서비스 제공자의 권리·의무를 규정함을 목적으로 합니다.
              </p>
              <p className="font-semibold">제2조 (서비스의 성격)</p>
              <p>
                서비스는 병변 이미지 분석 및 경과 관찰을 보조하는 비진단 정보 제공 도구이며,
                의학적 진단이나 치료를 대체하지 않습니다.
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold">1. 수집하는 개인정보 항목</p>
              <p>
                아이의 이름, 생년월일, 성별, 거주 지역, 병변 사진, 증상 기록, 진단·처방 정보를
                수집합니다. 사진과 건강 관련 기록은 민감정보로 분류되어 별도 동의를 받습니다.
              </p>
              <p className="font-semibold">2. 이용 목적 및 보관 기간</p>
              <p>
                수집된 정보는 경과 관찰 및 서비스 제공 목적으로만 사용하며, 회원 탈퇴 또는 삭제
                요청 시 지체 없이 파기합니다.
              </p>
            </>
          )}
        </div>

        <div className="mt-3 rounded-xl bg-canvas px-4 py-3 text-xs text-muted">
          개정 이력: v1.0 (2026.08.06 제정)
        </div>
      </div>
    </div>
  );
}
