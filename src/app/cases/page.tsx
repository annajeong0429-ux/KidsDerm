"use client";

import { useState } from "react";
import Link from "next/link";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Card } from "@/components/ui/Card";
import { TrendBadge } from "@/components/ui/Badge";
import { cases } from "@/lib/mock-data";

const FILTERS = ["전체", "관찰 중", "종료됨"] as const;

export default function CaseListPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("전체");

  const filtered = cases.filter((c) => {
    if (filter === "관찰 중") return c.active;
    if (filter === "종료됨") return !c.active;
    return true;
  });

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="관찰 사례" />

      <div className="flex gap-2 px-5 pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`h-8 rounded-full px-3.5 text-xs font-semibold transition-colors ${
              filter === f ? "bg-brand-600 text-white" : "bg-canvas text-muted border border-border"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-2.5 overflow-y-auto px-5 pb-6 pt-3">
        {filtered.map((c) => (
          <Link key={c.id} href={`/cases/${c.id}/timeline`}>
            <Card>
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-foreground">{c.bodyPart}</p>
                <TrendBadge status={c.status} />
              </div>
              <p className="mt-1.5 text-xs text-muted">
                시작일 {c.createdAt} · 관찰 {c.daysObserved}일째
              </p>
              <div className="mt-2.5 flex items-center gap-3 text-xs">
                <span className="text-muted">
                  최초 {c.baselineAreaRatio}% <span className="mx-1">→</span> 최근{" "}
                  <strong className="text-foreground">{c.latestAreaRatio}%</strong>
                </span>
              </div>
            </Card>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="pt-10 text-center text-sm text-muted">해당하는 사례가 없어요</p>
        )}
      </div>
    </div>
  );
}
