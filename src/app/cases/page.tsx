"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Card } from "@/components/ui/Card";
import { TrendBadge } from "@/components/ui/Badge";
import { listCases, type CaseSummary } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useChildProfile } from "@/lib/child-profile-context";

const FILTERS = ["전체", "관찰 중", "종료됨"] as const;

export default function CaseListPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("전체");
  const { accessToken } = useAuth();
  const { childProfile } = useChildProfile();
  // 어느 아이 것인지와 함께 보관해서, 아이를 바꾸면 새 목록이 도착하기 전까지
  // 이전 아이의 사례가 화면에 남지 않도록 한다.
  const [fetched, setFetched] = useState<{ childId: string; list: CaseSummary[] } | null>(null);

  useEffect(() => {
    if (!childProfile) return;
    const childId = childProfile.id;
    let cancelled = false;
    listCases(accessToken, childId)
      .then((list) => {
        if (!cancelled) setFetched({ childId, list });
      })
      .catch(() => {
        if (!cancelled) setFetched({ childId, list: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, childProfile]);

  const cases = childProfile && fetched?.childId === childProfile.id ? fetched.list : [];
  const loading = Boolean(childProfile) && fetched?.childId !== childProfile?.id;

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
        {loading && <p className="pt-10 text-center text-sm text-muted">불러오는 중...</p>}
        {!loading && filtered.length === 0 && (
          <p className="pt-10 text-center text-sm text-muted">
            {childProfile ? "해당하는 사례가 없어요" : "아이 프로필을 먼저 등록해 주세요"}
          </p>
        )}
      </div>
    </div>
  );
}
