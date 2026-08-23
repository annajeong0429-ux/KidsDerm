"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { CheckIcon } from "@/components/icons";

export default function RecordDonePage() {
  const router = useRouter();

  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-status-improve-bg">
        <CheckIcon className="h-9 w-9 text-status-improve" />
      </span>
      <h1 className="mt-5 text-xl font-bold text-foreground">기록이 저장되었어요</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        사진과 증상 기록을 바탕으로 AI 분석을 시작할게요.
        <br />
        잠시만 기다려 주세요.
      </p>
      <Button size="lg" className="mt-8" onClick={() => router.push("/analysis/progress")}>
        분석 결과 보기
      </Button>
    </div>
  );
}
