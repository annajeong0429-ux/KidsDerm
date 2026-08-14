import { HTMLAttributes } from "react";
import Link from "next/link";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-border bg-surface p-4 ${className}`}
      {...props}
    />
  );
}

export function SectionTitle({
  title,
  action,
}: {
  title: string;
  action?: { label: string; href?: string };
}) {
  return (
    <div className="flex items-end justify-between px-1 mb-2">
      <h2 className="text-[15px] font-bold text-foreground">{title}</h2>
      {action && action.href ? (
        <Link href={action.href} className="text-xs font-medium text-brand-700">
          {action.label}
        </Link>
      ) : action ? (
        <span className="text-xs font-medium text-brand-700">{action.label}</span>
      ) : null}
    </div>
  );
}
