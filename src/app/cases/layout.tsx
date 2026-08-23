import { AuthGate } from "@/components/auth/AuthGate";

export default function CasesLayout({ children }: { children: React.ReactNode }) {
  return <AuthGate>{children}</AuthGate>;
}
