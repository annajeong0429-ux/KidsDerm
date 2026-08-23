import type { TrendStatus } from "@/lib/types";
import { TrendDownIcon, TrendUpIcon } from "@/components/icons";

const trendStyle: Record<TrendStatus, { bg: string; fg: string; icon: "up" | "down" | "flat" }> = {
  "호전": { bg: "var(--color-status-improve-bg)", fg: "var(--color-status-improve)", icon: "down" },
  "유지": { bg: "var(--color-status-maintain-bg)", fg: "var(--color-status-maintain)", icon: "flat" },
  "확대 추세": { bg: "var(--color-status-caution-bg)", fg: "var(--color-status-caution)", icon: "up" },
};

export function TrendBadge({ status }: { status: TrendStatus }) {
  const s = trendStyle[status];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ backgroundColor: s.bg, color: s.fg }}
    >
      {s.icon === "down" && <TrendDownIcon className="h-3.5 w-3.5" />}
      {s.icon === "up" && <TrendUpIcon className="h-3.5 w-3.5" />}
      {status}
    </span>
  );
}

export function Pill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "brand" | "accent";
}) {
  const toneClasses = {
    neutral: "bg-canvas text-muted border border-border",
    brand: "bg-brand-50 text-brand-700",
    accent: "bg-accent-50 text-accent-700",
  } as const;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}
