"use client";

import { usePathname } from "next/navigation";
import { MedicalFlowProvider } from "@/lib/medical-context";
import { StepProgress } from "@/components/ui/ProgressDots";
import { AuthGate } from "@/components/auth/AuthGate";

const STEPS = ["/medical/diagnosis", "/medical/prescription", "/medical/followup"];

export default function MedicalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const stepIndex = STEPS.indexOf(pathname);

  return (
    <AuthGate>
      <MedicalFlowProvider>
        <div className="flex h-full flex-col">
          {stepIndex >= 0 && <StepProgress total={STEPS.length} current={stepIndex} />}
          <div className="flex flex-1 flex-col overflow-y-auto">{children}</div>
        </div>
      </MedicalFlowProvider>
    </AuthGate>
  );
}
