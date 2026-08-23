import { AuthGate } from "@/components/auth/AuthGate";

export default function AnalysisLayout({ children }: { children: React.ReactNode }) {
  return <AuthGate>{children}</AuthGate>;
}
