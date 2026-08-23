"use client";

import { use } from "react";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { DownloadIcon, ShareIcon } from "@/components/icons";

export default function ReportSharePage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params);

  const actions = [
    { icon: DownloadIcon, label: "PDF로 저장" },
    { icon: ShareIcon, label: "공유하기" },
    { icon: DownloadIcon, label: "이미지로 저장" },
  ];

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="리포트 내보내기" backHref={`/cases/${caseId}/report`} />

      <div className="flex-1 px-5 pt-2">
        <div className="grid grid-cols-3 gap-2.5">
          {actions.map((action) => (
            <button
              key={action.label}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface py-5"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50">
                <action.icon className="h-5 w-5 text-brand-600" />
              </span>
              <span className="text-xs font-medium text-foreground">{action.label}</span>
            </button>
          ))}
        </div>

        <p className="mt-4 text-xs leading-relaxed text-muted">
          내보낸 리포트에는 의학적 진단이 아닌 참고용 정보임을 알리는 고지 문구가 함께
          포함됩니다. 진료 시 의료진에게 보여주시면 경과를 빠르게 파악하는 데 도움이 돼요.
        </p>
      </div>
    </div>
  );
}
