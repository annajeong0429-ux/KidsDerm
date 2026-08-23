"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { ChevronRightIcon, MapPinIcon, UserIcon } from "@/components/icons";
import { useAuth } from "@/lib/auth-context";
import { useChildProfile } from "@/lib/child-profile-context";

const MENU_GROUPS: { title: string; items: { label: string; href: string }[] }[] = [
  {
    title: "계정",
    items: [
      { label: "아이 프로필 관리", href: "/profile" },
      { label: "지역 설정", href: "/settings/region" },
    ],
  },
  {
    title: "알림",
    items: [
      { label: "알림 설정", href: "/settings/notifications" },
      { label: "촬영 리마인더", href: "/notifications/reminder" },
    ],
  },
  {
    title: "데이터",
    items: [{ label: "데이터 내보내기·삭제", href: "/settings/data" }],
  },
  {
    title: "약관 및 고지",
    items: [
      { label: "이용약관 · 개인정보 처리방침", href: "/settings/terms" },
      { label: "서비스 고지사항", href: "/settings/notice" },
      { label: "온보딩 다시보기", href: "/onboarding/splash" },
    ],
  },
];

export default function SettingsHomePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { childProfile } = useChildProfile();

  async function handleLogout() {
    await logout();
    router.push("/onboarding/intro");
  }

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="설정" />

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <Link href="/profile" className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: childProfile.avatarColor }}
          >
            <UserIcon className="h-6 w-6 text-white" />
          </span>
          <span className="flex-1">
            <span className="block text-sm font-bold text-foreground">{childProfile.name} 보호자</span>
            <span className="mt-0.5 flex items-center gap-1 text-xs text-muted">
              <MapPinIcon className="h-3 w-3" /> {childProfile.region.province} {childProfile.region.district}
            </span>
            <span className="mt-0.5 block text-xs text-muted">
              {user ? `${user.email} 로그인됨` : "로그인이 필요해요"}
            </span>
          </span>
          <ChevronRightIcon className="h-4 w-4 text-muted" />
        </Link>

        {MENU_GROUPS.map((group) => (
          <div key={group.title} className="mt-5">
            <p className="mb-1.5 px-1 text-xs font-semibold text-muted">{group.title}</p>
            <div className="overflow-hidden rounded-2xl border border-border bg-surface">
              {group.items.map((item, i) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-3.5 text-sm text-foreground ${
                    i !== 0 ? "border-t border-border" : ""
                  }`}
                >
                  {item.label}
                  <ChevronRightIcon className="h-4 w-4 text-muted" />
                </Link>
              ))}
            </div>
          </div>
        ))}

        <button onClick={handleLogout} className="mt-6 w-full text-center text-sm font-medium text-muted">
          로그아웃
        </button>
      </div>
    </div>
  );
}
