"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, SectionTitle } from "@/components/ui/Card";
import { TrendBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CameraIcon, ChevronRightIcon, MapPinIcon, UserIcon } from "@/components/icons";
import { outbreakEntries } from "@/lib/mock-data";
import { getCase, listCases, type CaseSummary, type PhotoRecordWithSymptoms } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useChildProfile } from "@/lib/child-profile-context";

export default function HomePage() {
  const { user, accessToken } = useAuth();
  const { childProfile } = useChildProfile();
  // 어느 아이 것인지와 함께 보관한다 - 아이를 바꿨을 때 이전 아이의 사례·사진이
  // 새 데이터가 오기 전까지 화면에 남는 것을 구조적으로 막는다.
  const [fetched, setFetched] = useState<{
    childId: string;
    cases: CaseSummary[];
    photos: PhotoRecordWithSymptoms[];
  } | null>(null);
  // 유행 정보는 아직 질병관리청 API를 붙이지 않아서 목데이터를 그대로 쓴다.
  const risingOutbreaks = outbreakEntries.filter((o) => o.trend === "증가").slice(0, 2);

  useEffect(() => {
    if (!childProfile) return;
    const childId = childProfile.id;
    let cancelled = false;
    (async () => {
      try {
        const all = await listCases(accessToken, childId);
        const active = all.filter((c) => c.active);

        // 최근 기록 미리보기: 사진이 있는 가장 최근 사례 한 건만 펼쳐본다.
        // 사례를 전부 펼치면 홈 화면 한 번 여는 데 요청이 너무 많아진다.
        const newest = active.find((c) => c.photoCount > 0);
        const photos = newest ? (await getCase(accessToken, newest.id)).photos : [];
        if (!cancelled) {
          setFetched({ childId, cases: active, photos: [...photos].reverse().slice(0, 3) });
        }
      } catch {
        if (!cancelled) setFetched({ childId, cases: [], photos: [] });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accessToken, childProfile]);

  const current = childProfile && fetched?.childId === childProfile.id ? fetched : null;
  const activeCases = current?.cases ?? [];
  const recentPhotos = current?.photos ?? [];

  return (
    <div className="flex flex-col px-5 pb-6 pt-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted">
            {childProfile ? `${childProfile.region.province} ${childProfile.region.district}` : "키즈덤AI"}
          </p>
          <h1 className="text-lg font-bold text-foreground">
            {childProfile
              ? `${childProfile.name} 보호자님, 안녕하세요`
              : user
                ? "아이 프로필을 등록해 주세요"
                : "로그인하고 시작해보세요"}
          </h1>
        </div>
        <Link
          href={user ? "/profile" : "/login"}
          className="flex h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: childProfile?.avatarColor ?? "var(--color-border)" }}
        >
          <UserIcon className="h-5 w-5 text-white" />
        </Link>
      </div>

      <Link
        href="/record/guide"
        className="mt-5 flex items-center justify-between rounded-2xl bg-brand-600 px-5 py-4 text-white"
      >
        <span>
          <span className="block text-sm font-semibold">오늘 병변 촬영하기</span>
          <span className="mt-0.5 block text-xs text-brand-100">촬영 가이드에 따라 30초면 충분해요</span>
        </span>
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
          <CameraIcon className="h-5 w-5" />
        </span>
      </Link>

      {user ? (
        <>
          <div className="mt-6">
            <SectionTitle title="관찰 중인 사례" action={{ label: "전체보기", href: "/cases" }} />
            <div className="space-y-2.5">
              {activeCases.map((c) => (
                <Link key={c.id} href={`/cases/${c.id}/timeline`}>
                  <Card className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-foreground">{c.bodyPart}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        관찰 {c.daysObserved}일째 · 면적 비율 {c.latestAreaRatio}%
                      </p>
                    </div>
                    <TrendBadge status={c.status} />
                  </Card>
                </Link>
              ))}
              {activeCases.length === 0 && (
                <Card>
                  <p className="text-center text-sm text-muted">
                    {childProfile
                      ? "아직 관찰 중인 사례가 없어요. 촬영을 시작해 보세요."
                      : "아이 프로필을 먼저 등록해 주세요."}
                  </p>
                </Card>
              )}
            </div>
          </div>

          <div className="mt-6">
            <SectionTitle title="최근 기록" action={{ label: "기록 보기", href: "/cases" }} />
            <Link href="/cases" className="no-scrollbar flex gap-2.5 overflow-x-auto pb-1">
              {recentPhotos.map((p) => (
                <div key={p.id} className="w-28 shrink-0 rounded-xl border border-border bg-surface p-2">
                  <div className="h-20 w-full rounded-lg" style={{ backgroundColor: p.imageColor }} />
                  <p className="mt-1.5 text-[11px] font-medium text-foreground">{p.takenAt.slice(5)}</p>
                  <p className="text-[11px] text-muted">면적 {p.areaRatio}%</p>
                </div>
              ))}
            </Link>
          </div>
        </>
      ) : (
        <div className="mt-6">
          <Card className="flex flex-col items-center gap-3 py-6 text-center">
            <p className="text-sm text-muted">
              로그인하면 우리 아이의 관찰 사례와 촬영 기록을 여기서 확인할 수 있어요.
            </p>
            <Link href="/login" className="w-full">
              <Button fullWidth>로그인하기</Button>
            </Link>
          </Card>
        </div>
      )}

      <div className="mt-6">
        <SectionTitle title="우리 지역 유행 현황" />
        <Card>
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <MapPinIcon className="h-3.5 w-3.5" />
            {childProfile
              ? `${childProfile.region.province} ${childProfile.region.district} · 질병관리청 기준`
              : "질병관리청 기준"}
          </div>
          <div className="mt-3 space-y-2">
            {risingOutbreaks.map((o) => (
              <div key={o.diseaseName} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{o.diseaseName}</span>
                <span className="font-semibold text-status-caution">신고 {o.changeRate}% 증가</span>
              </div>
            ))}
          </div>
          <Link href="/outbreak" className="mt-3 flex items-center justify-center gap-1 text-xs font-medium text-brand-700">
            자세히 보기 <ChevronRightIcon className="h-3.5 w-3.5" />
          </Link>
        </Card>
      </div>
    </div>
  );
}
