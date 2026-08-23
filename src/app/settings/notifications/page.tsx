"use client";

import { useState } from "react";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Card } from "@/components/ui/Card";
import { AuthGate } from "@/components/auth/AuthGate";

const TYPES = [
  { key: "reminder", label: "촬영 리마인더", desc: "경과 관찰 주기에 맞춘 촬영 알림" },
  { key: "change", label: "변화 감지", desc: "면적·징후가 크게 변할 때 알림" },
  { key: "outbreak", label: "지역 유행 정보", desc: "우리 지역 감염병 신고 급증 시 알림" },
] as const;

export default function NotificationSettingsPage() {
  const [toggles, setToggles] = useState({ reminder: true, change: true, outbreak: false });
  const [dndOn, setDndOn] = useState(true);
  const [dndStart, setDndStart] = useState("22:00");
  const [dndEnd, setDndEnd] = useState("08:00");

  return (
    <AuthGate>
    <div className="flex h-full flex-col">
      <ScreenHeader title="알림 설정" backHref="/settings" />

      <div className="flex-1 space-y-3 overflow-y-auto px-5 pb-6">
        {TYPES.map((t) => (
          <Card key={t.key} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">{t.label}</p>
              <p className="mt-0.5 text-xs text-muted">{t.desc}</p>
            </div>
            <button
              onClick={() => setToggles((prev) => ({ ...prev, [t.key]: !prev[t.key] }))}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                toggles[t.key] ? "bg-brand-600" : "bg-border"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  toggles[t.key] ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </Card>
        ))}

        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">방해 금지 시간대</p>
            <button
              onClick={() => setDndOn((v) => !v)}
              className={`relative h-6 w-11 rounded-full transition-colors ${dndOn ? "bg-brand-600" : "bg-border"}`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${dndOn ? "translate-x-5" : "translate-x-0.5"}`}
              />
            </button>
          </div>
          {dndOn && (
            <div className="mt-3 flex items-center gap-2">
              <input
                type="time"
                value={dndStart}
                onChange={(e) => setDndStart(e.target.value)}
                className="h-10 flex-1 rounded-lg border border-border bg-canvas px-3 text-sm"
              />
              <span className="text-muted">~</span>
              <input
                type="time"
                value={dndEnd}
                onChange={(e) => setDndEnd(e.target.value)}
                className="h-10 flex-1 rounded-lg border border-border bg-canvas px-3 text-sm"
              />
            </div>
          )}
        </Card>
      </div>
    </div>
    </AuthGate>
  );
}
