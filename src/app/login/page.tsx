"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LogoMark, Wordmark, CheckIcon } from "@/components/icons";
import { ApiError, useAuth } from "@/lib/auth-context";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

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
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [autoLogin, setAutoLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.push(searchParams.get("redirect") || "/");
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "로그인에 실패했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex h-full flex-col items-center justify-center bg-canvas px-4">
      <div className="w-full rounded-[32px] bg-surface px-7 py-9">
        <div className="flex flex-col items-center gap-2.5">
          <LogoMark className="h-16 w-16" />
          <Wordmark className="text-xl" />
        </div>

        <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-semibold text-foreground">이메일</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1.5 h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground">비밀번호</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              className="mt-1.5 h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-brand-500"
            />
          </div>

          {error && <p className="text-xs font-medium text-accent-600">{error}</p>}

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
            disabled={submitting}
            className="h-12 w-full rounded-xl bg-brand-600 text-sm font-bold text-white disabled:opacity-60"
          >
            {submitting ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted">또는</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <div className="flex justify-center gap-4">
          <a
            href={`${API_BASE}/auth/kakao/login`}
            className="flex h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: "var(--color-kakao)" }}
          >
            <KakaoIcon />
          </a>
          <a
            href={`${API_BASE}/auth/naver/login`}
            className="flex h-12 w-12 items-center justify-center rounded-full text-base font-bold text-white"
            style={{ backgroundColor: "var(--color-naver)" }}
          >
            N
          </a>
          <a
            href={`${API_BASE}/auth/google/login`}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-white text-base font-bold text-muted"
          >
            G
          </a>
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
