"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogoMark, Wordmark } from "@/components/icons";

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.push("/onboarding/intro"), 1400);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-4 bg-canvas">
      <LogoMark className="h-16 w-16" />
      <Wordmark className="text-lg" />
      <div className="mt-4 flex gap-1.5">
        <span className="h-2 w-2 animate-bounce rounded-full bg-brand-300 [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-brand-300 [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-brand-300" />
      </div>
      <span className="absolute bottom-8 text-xs text-muted">예선 MVP v0.1</span>
    </div>
  );
}
