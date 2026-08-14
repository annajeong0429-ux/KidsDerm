"use client";

import { useRouter } from "next/navigation";
import { LogoMark } from "@/components/icons";

export default function IntroPage() {
  const router = useRouter();

  return (
    <div className="flex h-full flex-col items-center justify-center bg-canvas px-4">
      <div className="flex w-full flex-col items-center rounded-[32px] bg-surface px-8 py-12 text-center">
        <LogoMark className="h-[120px] w-[120px]" />

        <h1 className="mt-7 text-xl font-bold leading-snug text-foreground">
          아이의 피부 관리,
          <br />
          이제 혼자 하지 마세요.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          아이의 피부를 꼼꼼히 기록하는
          <br />
          작은 도우미, 키즈덤과 함께해요.
        </p>

        <button
          onClick={() => router.push("/onboarding/consent")}
          className="mt-16 h-14 w-full rounded-xl bg-brand-600 text-base font-bold text-white"
        >
          시작하기
        </button>
      </div>
    </div>
  );
}
