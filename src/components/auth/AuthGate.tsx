"use client";

import type { ReactNode } from "react";
import { useRequireAuth } from "@/lib/auth-context";

/**
 * 이 컴포넌트로 감싼 화면은 로그인 안 하면 볼 수 없다 (자동으로 /login?redirect=... 로 이동).
 * 로그인 확인 중이거나 리다이렉트 중일 때는 빈 화면(스피너)만 잠깐 보여준다.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading } = useRequireAuth();

  if (loading || !user) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-brand-600" />
      </div>
    );
  }

  return <>{children}</>;
}
