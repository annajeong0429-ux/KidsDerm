"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogoMark, Wordmark, CheckIcon } from "@/components/icons";

function KakaoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5">
      <path
        d="M12 4C6.9 4 3 7.1 3 10.9c0 2.4 1.6 4.5 4 5.8l-.9 3.4c-.1.4.3.7.7.5l4-2.4c.4 0 .8.1 1.2.1 5.1 0 9-3.1 9-6.9S17.1 4 12 4Z"
        fill="#391b1b"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [autoLogin, setAutoLogin] = useState(false);

  return (
    <div className="flex h-full flex-col items-center justify-center bg-canvas px-4">
      <div className="w-full rounded-[32px] bg-surface px-7 py-9">
        <div className="flex flex-col items-center gap-2.5">
          <LogoMark className="h-16 w-16" />
          <Wordmark className="text-xl" />
        </div>

        <form
          className="mt-7 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            router.push("/");
          }}
        >
          <div>
            <label className="text-sm font-semibold text-foreground">이메일</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              className="mt-1.5 h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground">비밀번호</label>
            <input
              type="password"
              required
              placeholder="비밀번호 입력"
              className="mt-1.5 h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <button
              type="button"
              onClick={() => setAutoLogin((v) => !v)}
              className="flex items-center gap-1.5"
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded border ${
                  autoLogin ? "border-brand-600 bg-brand-600" : "border-border bg-white"
                }`}
              >
                {autoLogin && <CheckIcon className="h-3 w-3 text-white" />}
              </span>
              <span className="text-xs text-muted">자동 로그인</span>
            </button>
            <button type="button" className="text-xs text-muted underline underline-offset-2">
              비밀번호 찾기
            </button>
          </div>

          <button
            type="submit"
            className="h-12 w-full rounded-xl bg-brand-600 text-sm font-bold text-white"
          >
            로그인
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted">또는</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="flex h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: "var(--color-kakao)" }}
          >
            <KakaoIcon />
          </button>
          <button
            onClick={() => router.push("/")}
            className="flex h-12 w-12 items-center justify-center rounded-full text-base font-bold text-white"
            style={{ backgroundColor: "var(--color-naver)" }}
          >
            N
          </button>
          <button
            onClick={() => router.push("/")}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-white text-base font-bold text-muted"
          >
            G
          </button>
        </div>

        <p className="mt-7 text-center text-sm text-muted">
          아직 계정이 없으신가요?{" "}
          <Link href="/signup" className="font-bold text-foreground">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
