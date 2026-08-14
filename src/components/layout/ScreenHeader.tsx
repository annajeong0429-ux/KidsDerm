import Link from "next/link";
import { ChevronLeftIcon } from "@/components/icons";
import type { ReactNode } from "react";

export function ScreenHeader({
  title,
  backHref,
  right,
}: {
  title?: string;
  backHref?: string;
  right?: ReactNode;
}) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between px-2">
      <div className="flex items-center gap-0.5">
        {backHref && (
          <Link
            href={backHref}
            className="flex h-9 w-9 items-center justify-center rounded-full active:bg-black/5"
          >
            <ChevronLeftIcon className="h-5 w-5 text-foreground" />
          </Link>
        )}
        {title && <h1 className="px-1.5 text-base font-bold text-foreground">{title}</h1>}
      </div>
      <div className="pr-2">{right}</div>
    </header>
  );
}
