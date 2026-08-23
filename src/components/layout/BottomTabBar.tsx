"use client";

import Link from "next/link";
import { BellIcon, CameraIcon, HomeIcon, SettingsIcon } from "@/components/icons";

const TABS = [
  { href: "/", label: "홈", icon: HomeIcon },
  { href: "/record/guide", label: "기록", icon: CameraIcon, matchPrefix: "/record" },
  { href: "/notifications", label: "알림", icon: BellIcon },
  { href: "/settings", label: "설정", icon: SettingsIcon, matchPrefix: "/settings" },
] as const;

export function BottomTabBar({ pathname }: { pathname: string }) {
  return (
    <nav className="flex shrink-0 items-stretch border-t border-border bg-surface">
      {TABS.map((tab) => {
        const active = "matchPrefix" in tab && tab.matchPrefix ? pathname.startsWith(tab.matchPrefix) : pathname === tab.href;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex flex-1 flex-col items-center gap-0.5 py-2.5"
          >
            <Icon className={`h-5 w-5 ${active ? "text-brand-700" : "text-muted"}`} />
            <span className={`text-[11px] font-medium ${active ? "text-brand-700" : "text-muted"}`}>
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
