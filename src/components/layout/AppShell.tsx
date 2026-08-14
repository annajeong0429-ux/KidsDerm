"use client";

import { usePathname } from "next/navigation";
import { BottomTabBar } from "./BottomTabBar";

const TAB_ROOT_PATHS = ["/", "/cases", "/notifications", "/settings"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showTabs = TAB_ROOT_PATHS.includes(pathname);

  return (
    <div className="flex min-h-dvh w-full justify-center bg-canvas sm:py-6">
      <div className="relative flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-canvas sm:h-[900px] sm:max-h-[calc(100dvh-3rem)] sm:rounded-[2.5rem] sm:border sm:border-border sm:shadow-2xl sm:shadow-black/10">
        <div className="flex-1 overflow-y-auto">{children}</div>
        {showTabs && <BottomTabBar pathname={pathname} />}
      </div>
    </div>
  );
}
