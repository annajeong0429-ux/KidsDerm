"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { currentChild as defaultChildProfile } from "@/lib/mock-data";
import type { ChildProfile } from "@/lib/types";

const STORAGE_KEY = "kidsderm_child_profile";

interface ChildProfileState {
  childProfile: ChildProfile;
  setChildProfile: (profile: ChildProfile) => void;
}

const ChildProfileContext = createContext<ChildProfileState | null>(null);

export function ChildProfileProvider({ children }: { children: ReactNode }) {
  // 아직 백엔드에 아이 프로필 저장 API가 없어서, 우선 이 브라우저에만 남는 localStorage로
  // 대체한다 - CM-03-01(프로필 등록)에서 입력한 값이 홈 화면과 일치하게 만드는 게 목적.
  const [childProfile, setChildProfileState] = useState<ChildProfile>(defaultChildProfile);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setChildProfileState(JSON.parse(saved));
      } catch {
        // 저장된 값이 깨져있으면 무시하고 기본값을 유지한다.
      }
    }
  }, []);

  function setChildProfile(profile: ChildProfile) {
    setChildProfileState(profile);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }

  return (
    <ChildProfileContext.Provider value={{ childProfile, setChildProfile }}>{children}</ChildProfileContext.Provider>
  );
}

export function useChildProfile() {
  const ctx = useContext(ChildProfileContext);
  if (!ctx) throw new Error("useChildProfile must be used within ChildProfileProvider");
  return ctx;
}
