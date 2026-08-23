"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";

const TABS = [
  { key: "timeline", label: "타임라인" },
  { key: "compare", label: "사진 비교" },
  { key: "chart", label: "그래프" },
  { key: "summary", label: "변화 요약" },
  { key: "report", label: "리포트" },
  { key: "history", label: "진료 이력" },
];

export default function CaseDetailLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams<{ caseId: string }>();

  return (
    <div className="flex h-full flex-col">
      <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-4 pb-2 pt-1">
        {TABS.map((tab) => {
          const href = `/cases/${params.caseId}/${tab.key}`;
          const active = pathname.startsWith(href);
          return (
            <Link
              key={tab.key}
              href={href}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                active ? "bg-brand-600 text-white" : "bg-canvas text-muted border border-border"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto">{children}</div>
    </div>
  );
}
