"use client";

import { useRouter } from "next/navigation";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Button } from "@/components/ui/Button";
import { useChildProfile } from "@/lib/child-profile-context";
import { UserIcon } from "@/components/icons";

function ageOf(birthDate: string) {
  const diff = Date.now() - new Date(birthDate).getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}

export default function ProfileListPage() {
  const router = useRouter();
  const { children: childProfiles, childProfile, loading, selectChild } = useChildProfile();
  const activeId = childProfile?.id ?? null;

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="아이 프로필" backHref="/" />

      <div className="flex-1 space-y-3 px-6 pt-2">
        {loading && <p className="py-8 text-center text-sm text-muted">불러오는 중...</p>}

        {!loading && childProfiles.length === 0 && (
          <p className="py-8 text-center text-sm text-muted">
            아직 등록한 아이가 없어요. 아래에서 프로필을 추가해 주세요.
          </p>
        )}

        {childProfiles.map((child) => (
          <button
            key={child.id}
            onClick={() => selectChild(child.id)}
            className={`flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-colors ${
              activeId === child.id ? "border-brand-500 bg-brand-50" : "border-border bg-surface"
            }`}
          >
            <span
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: child.avatarColor }}
            >
              <UserIcon className="h-6 w-6 text-white" />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-bold text-foreground">{child.name}</span>
              <span className="block text-xs text-muted">
                만 {ageOf(child.birthDate)}세 · {child.gender} · {child.region.province} {child.region.district}
              </span>
            </span>
            {activeId === child.id && (
              <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                선택됨
              </span>
            )}
          </button>
        ))}

        <button
          onClick={() => router.push("/profile/new")}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-3.5 text-sm font-medium text-muted"
        >
          + 아이 프로필 추가
        </button>
      </div>

      <div className="px-6 pb-6 pt-4">
        <Button fullWidth size="lg" onClick={() => router.push("/")} disabled={!childProfile}>
          이 프로필로 계속하기
        </Button>
      </div>
    </div>
  );
}
