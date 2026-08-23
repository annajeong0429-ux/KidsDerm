"use client";

import { useState } from "react";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Button } from "@/components/ui/Button";
import { DownloadIcon, TrashIcon } from "@/components/icons";
import { AuthGate } from "@/components/auth/AuthGate";

export default function DataManagementPage() {
  const [deleteStep, setDeleteStep] = useState(0);

  return (
    <AuthGate>
    <div className="flex h-full flex-col">
      <ScreenHeader title="데이터 내보내기·삭제" backHref="/settings" />

      <div className="flex-1 space-y-3 px-6 pt-2">
        <p className="text-sm text-muted">내 아이의 모든 기록을 내려받거나 삭제할 수 있어요.</p>

        <div className="grid grid-cols-2 gap-2.5">
          <button className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface py-5">
            <DownloadIcon className="h-5 w-5 text-brand-600" />
            <span className="text-xs font-medium text-foreground">PDF로 내보내기</span>
          </button>
          <button className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface py-5">
            <DownloadIcon className="h-5 w-5 text-brand-600" />
            <span className="text-xs font-medium text-foreground">ZIP으로 내보내기</span>
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-accent-200 bg-accent-50 p-4">
          <p className="flex items-center gap-1.5 text-sm font-bold text-accent-700">
            <TrashIcon className="h-4 w-4" /> 계정 및 데이터 영구 삭제
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-accent-700">
            삭제 시 아이의 프로필, 사진 기록, 진료 이력이 모두 영구적으로 삭제되며 복구할 수
            없습니다.
          </p>

          {deleteStep === 0 && (
            <button
              onClick={() => setDeleteStep(1)}
              className="mt-3 h-10 w-full rounded-xl border border-accent-300 text-sm font-semibold text-accent-700"
            >
              삭제 시작하기
            </button>
          )}
          {deleteStep === 1 && (
            <div className="mt-3 space-y-2">
              <p className="text-xs font-semibold text-accent-700">정말 삭제하시겠어요? (1/2)</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setDeleteStep(0)}>
                  취소
                </Button>
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => setDeleteStep(2)}>
                  계속하기
                </Button>
              </div>
            </div>
          )}
          {deleteStep === 2 && (
            <div className="mt-3 space-y-2">
              <p className="text-xs font-semibold text-accent-700">
                마지막 확인입니다 (2/2). &ldquo;삭제&rdquo;를 입력하면 모든 데이터가 삭제돼요.
              </p>
              <input
                placeholder="삭제"
                className="h-10 w-full rounded-lg border border-accent-300 bg-white px-3 text-sm"
              />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setDeleteStep(0)}>
                  취소
                </Button>
                <Button variant="secondary" size="sm" className="flex-1">
                  영구 삭제
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </AuthGate>
  );
}
