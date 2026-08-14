"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { CheckIcon } from "@/components/icons";
import { useSignupFlow } from "@/lib/signup-context";

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{8,}$/;

export default function SignupPage() {
  const router = useRouter();
  const { email, setEmail, password, setPassword } = useSignupFlow();
  const [confirm, setConfirm] = useState("");
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!PASSWORD_RULE.test(password)) {
      setError("비밀번호는 8자 이상, 소문자·숫자·특수문자를 각 1개 이상 포함해야 해요.");
      return;
    }
    if (password !== confirm) {
      setError("비밀번호가 서로 달라요.");
      return;
    }
    setError(null);
    router.push("/signup/terms");
  }

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="회원가입" backHref="/login" />

      <form className="flex flex-1 flex-col px-6 pt-2" onSubmit={handleSubmit}>
        <label className="text-sm font-medium text-foreground">이메일</label>
        <div className="mt-1.5 flex gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setChecked(false);
            }}
            placeholder="example@email.com"
            className="h-12 flex-1 rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-brand-500"
          />
          <Button type="button" variant="outline" onClick={() => setChecked(true)} disabled={!email}>
            중복 확인
          </Button>
        </div>
        {checked && (
          <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-status-improve">
            <CheckIcon className="h-3.5 w-3.5" /> 사용 가능한 이메일입니다
          </p>
        )}

        <label className="mt-4 text-sm font-medium text-foreground">비밀번호</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="8자 이상, 영문·숫자·특수문자 포함"
          className="mt-1.5 h-12 rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-brand-500"
        />

        <label className="mt-4 text-sm font-medium text-foreground">비밀번호 확인</label>
        <input
          type="password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="비밀번호를 한 번 더 입력해 주세요"
          className="mt-1.5 h-12 rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-brand-500"
        />

        {error && <p className="mt-2 text-xs font-medium text-accent-600">{error}</p>}

        <Button type="submit" fullWidth size="lg" className="mt-8" disabled={!checked}>
          다음
        </Button>
      </form>
    </div>
  );
}
