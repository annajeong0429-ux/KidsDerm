"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface SignupFlowState {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
}

const SignupFlowContext = createContext<SignupFlowState | null>(null);

export function SignupFlowProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <SignupFlowContext.Provider value={{ email, setEmail, password, setPassword }}>
      {children}
    </SignupFlowContext.Provider>
  );
}

export function useSignupFlow() {
  const ctx = useContext(SignupFlowContext);
  if (!ctx) throw new Error("useSignupFlow must be used within SignupFlowProvider");
  return ctx;
}
