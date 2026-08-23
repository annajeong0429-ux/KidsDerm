import { SignupFlowProvider } from "@/lib/signup-context";

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <SignupFlowProvider>{children}</SignupFlowProvider>;
}
