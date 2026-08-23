"use client";

import { useState } from "react";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { BellIcon, CalendarIcon, MapPinIcon, TrendDownIcon } from "@/components/icons";
import { notifications as initialNotifications } from "@/lib/mock-data";
import type { AppNotification } from "@/lib/types";

const typeIcon: Record<AppNotification["type"], typeof BellIcon> = {
  리마인더: CalendarIcon,
  변화감지: TrendDownIcon,
  유행정보: MapPinIcon,
};

function timeAgo(iso: string) {
  const diffMs = Date.parse("2026-08-14T12:00:00") - Date.parse(iso);
  const hours = Math.floor(diffMs / 3600000);
  if (hours < 24) return `${Math.max(hours, 1)}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

export default function NotificationsPage() {
  const [items, setItems] = useState(initialNotifications);

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="알림" />

      <div className="flex-1 space-y-2 overflow-y-auto px-5 pb-6">
        {items.map((n) => {
          const Icon = typeIcon[n.type];
          return (
            <button
              key={n.id}
              onClick={() => setItems((prev) => prev.map((i) => (i.id === n.id ? { ...i, read: true } : i)))}
              className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-colors ${
                n.read ? "border-border bg-surface" : "border-brand-200 bg-brand-50"
              }`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white">
                <Icon className="h-[18px] w-[18px] text-brand-600" />
              </span>
              <span className="flex-1">
                <span className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">{n.title}</span>
                  {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-accent-500" />}
                </span>
                <span className="mt-0.5 block text-xs text-muted">{n.body}</span>
                <span className="mt-1 block text-[11px] text-muted">{timeAgo(n.createdAt)}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
