import { AuthGate } from "@/components/auth/AuthGate";

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return <AuthGate>{children}</AuthGate>;
}
