"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Button } from "@/components/ui/Button";
import { useRecordFlow, type BodyPartSelection } from "@/lib/record-context";
import type { BodyPart } from "@/lib/types";

const BODY_PARTS: BodyPart[] = ["얼굴", "목", "팔 접히는 부위(팔오금)", "다리 접히는 부위(오금)", "몸통", "손·발"];
const OPTIONS: BodyPartSelection[] = [...BODY_PARTS, "기타"];

export default function ConfirmPhotoPage() {
  const router = useRouter();
  const { photoColor, bodyPart, setBodyPart, bodyPartDetail, setBodyPartDetail } = useRecordFlow();

  useEffect(() => {
    if (!photoColor) router.replace("/record/camera");
  }, [photoColor, router]);

  if (!photoColor) return null;

  const isOther = bodyPart === "기타";
  const canProceed = Boolean(bodyPart) && (!isOther || bodyPartDetail.trim().length > 0);

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="촬영 결과 확인" backHref="/record/camera" />

      <div className="flex-1 overflow-y-auto px-6 pt-2">
        <div className="aspect-square w-full rounded-2xl" style={{ backgroundColor: photoColor }} />

        <p className="mt-4 text-sm font-medium text-foreground">촬영 부위를 선택해 주세요</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {OPTIONS.map((part) => (
            <button
              key={part}
              onClick={() => setBodyPart(part)}
              className={`h-11 rounded-xl border px-2 text-xs font-semibold transition-colors ${
                bodyPart === part ? "border-brand-600 bg-brand-50 text-brand-700" : "border-border text-muted"
              }`}
            >
              {part}
            </button>
          ))}
        </div>

        {bodyPart && (
          <div className="mt-3">
            <label className="text-xs font-medium text-muted">
              {isOther ? "부위 이름을 직접 적어주세요" : "부위를 더 자세히 적어주세요 (선택)"}
            </label>
            <input
              value={bodyPartDetail}
              onChange={(e) => setBodyPartDetail(e.target.value)}
              placeholder={isOther ? "예: 겨드랑이 안쪽" : "예: 왼쪽 팔꿈치 안쪽"}
              className="mt-1.5 h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-brand-500"
            />
          </div>
        )}
      </div>

      <div className="flex gap-2 px-6 pb-6 pt-3">
        <Button variant="outline" size="lg" onClick={() => router.push("/record/camera")}>
          재촬영
        </Button>
        <Button
          fullWidth
          size="lg"
          disabled={!canProceed}
          onClick={() => router.push("/record/symptoms")}
        >
          다음
        </Button>
      </div>
    </div>
  );
}
