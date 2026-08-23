"use client";

import { useState } from "react";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Card } from "@/components/ui/Card";
import { cases } from "@/lib/mock-data";

export default function ReminderSettingsPage() {
  const activeCases = cases.filter((c) => c.active);
  const [settings, setSettings] = useState(
    Object.fromEntries(activeCases.map((c) => [c.id, { cycle: 2 as 1 | 2 | 3, time: "09:00", on: true }]))
  );

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="촬영 리마인더 설정" backHref="/notifications" />

      <div className="flex-1 space-y-3 overflow-y-auto px-5 pb-6">
        {activeCases.map((c) => {
          const s = settings[c.id];
          return (
            <Card key={c.id}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-foreground">{c.bodyPart}</p>
                <button
                  onClick={() =>
                    setSettings((prev) => ({ ...prev, [c.id]: { ...prev[c.id], on: !prev[c.id].on } }))
                  }
                  className={`relative h-6 w-11 rounded-full transition-colors ${s.on ? "bg-brand-600" : "bg-border"}`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${s.on ? "translate-x-5" : "translate-x-0.5"}`}
                  />
                </button>
              </div>

              {s.on && (
                <div className="mt-3 space-y-3">
                  <div>
                    <p className="text-xs text-muted">주기</p>
                    <div className="mt-1.5 grid grid-cols-3 gap-2">
                      {([1, 2, 3] as const).map((d) => (
                        <button
                          key={d}
                          onClick={() =>
                            setSettings((prev) => ({ ...prev, [c.id]: { ...prev[c.id], cycle: d } }))
                          }
                          className={`h-9 rounded-lg border text-xs font-semibold ${
                            s.cycle === d ? "border-brand-600 bg-brand-50 text-brand-700" : "border-border text-muted"
                          }`}
                        >
                          {d}일마다
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted">알림 시각</p>
                    <input
                      type="time"
                      value={s.time}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, [c.id]: { ...prev[c.id], time: e.target.value } }))
                      }
                      className="mt-1.5 h-9 rounded-lg border border-border bg-surface px-3 text-sm"
                    />
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
