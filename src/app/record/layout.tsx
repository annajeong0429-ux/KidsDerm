"use client";

import { usePathname } from "next/navigation";
import { RecordFlowProvider } from "@/lib/record-context";
import { StepProgress } from "@/components/ui/ProgressDots";
import { AuthGate } from "@/components/auth/AuthGate";

const STEPS = ["/record/guide", "/record/camera", "/record/confirm", "/record/symptoms", "/record/onset"];

export default function RecordLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const normalized = pathname === "/record/gallery" ? "/record/camera" : pathname;
  const stepIndex = STEPS.indexOf(normalized);
  const showProgress = stepIndex >= 0;

  return (
    <AuthGate>
      <RecordFlowProvider>
        <div className="flex h-full flex-col">
          {showProgress && <StepProgress total={STEPS.length} current={stepIndex} />}
          <div className="flex flex-1 flex-col overflow-y-auto">{children}</div>
        </div>
      </RecordFlowProvider>
    </AuthGate>
  );
}
