"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import * as api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { ChildProfile } from "@/lib/types";

interface ChildProfileState {
  /** 로그인한 보호자가 등록한 아이 전체. */
  children: ChildProfile[];
  /** 지금 화면들이 기준으로 삼는 아이. 로그인 전이거나 아직 아이를 등록하지 않았으면 null. */
  childProfile: ChildProfile | null;
  loading: boolean;
  selectChild: (childId: string) => void;
  createChild: (input: api.ChildProfileInput) => Promise<ChildProfile>;
  updateChild: (childId: string, input: api.ChildProfileInput) => Promise<ChildProfile>;
  removeChild: (childId: string) => Promise<void>;
}

const ChildProfileContext = createContext<ChildProfileState | null>(null);

/** 어느 계정으로 받아온 목록인지까지 같이 들고 있는다 - 아래 useState 설명 참고. */
interface FetchedChildren {
  userId: number;
  list: ChildProfile[];
}

export function ChildProfileProvider({ children: reactChildren }: { children: ReactNode }) {
  const { user, accessToken, loading: authLoading } = useAuth();
  // 목록을 "누구 것인지"와 함께 보관한다. 이렇게 해두면 계정이 바뀌었을 때 따로 비우지
  // 않아도, 렌더할 때 지금 로그인한 사람 것이 아니면 자동으로 무시된다 - 이전 사용자의
  // 아이 이름이 화면에 잠깐이라도 남는 일이 구조적으로 불가능해진다.
  const [fetched, setFetched] = useState<FetchedChildren | null>(null);
  const [manualSelection, setManualSelection] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;

    let cancelled = false;
    api
      .listChildren(accessToken)
      .then((list) => {
        if (!cancelled) setFetched({ userId: user.id, list });
      })
      .catch(() => {
        // 실패해도 "빈 목록을 받아온 상태"로 표시해야 화면이 계속 로딩중에 머물지 않는다.
        if (!cancelled) setFetched({ userId: user.id, list: [] });
      });

    return () => {
      cancelled = true;
    };
  }, [user, accessToken, authLoading]);

  // 지금 로그인한 사람의 목록일 때만 쓴다.
  const children = user && fetched?.userId === user.id ? fetched.list : [];
  const loading = authLoading || (Boolean(user) && fetched?.userId !== user?.id);
  // 사용자가 직접 고른 아이가 있으면 그 아이, 없으면 첫 번째 아이.
  // (직접 고른 값은 이번 방문 동안만 유지된다 - 새로고침하면 다시 첫 아이로 돌아간다.)
  const childProfile = children.find((c) => c.id === manualSelection) ?? children[0] ?? null;

  const selectChild = useCallback((childId: string) => {
    setManualSelection(childId);
  }, []);

  const createChild = useCallback(
    async (input: api.ChildProfileInput) => {
      const created = await api.createChild(accessToken, input);
      setFetched((prev) => (prev ? { ...prev, list: [...prev.list, created] } : prev));
      setManualSelection(created.id);
      return created;
    },
    [accessToken],
  );

  const updateChild = useCallback(
    async (childId: string, input: api.ChildProfileInput) => {
      const updated = await api.updateChild(accessToken, childId, input);
      setFetched((prev) =>
        prev ? { ...prev, list: prev.list.map((c) => (c.id === childId ? updated : c)) } : prev,
      );
      return updated;
    },
    [accessToken],
  );

  const removeChild = useCallback(
    async (childId: string) => {
      await api.deleteChild(accessToken, childId);
      setFetched((prev) => (prev ? { ...prev, list: prev.list.filter((c) => c.id !== childId) } : prev));
      // 지운 아이를 고른 상태였다면 선택을 비운다 - 그러면 자동으로 첫 아이가 선택된다.
      setManualSelection((current) => (current === childId ? null : current));
    },
    [accessToken],
  );

  return (
    <ChildProfileContext.Provider
      value={{ children, childProfile, loading, selectChild, createChild, updateChild, removeChild }}
    >
      {reactChildren}
    </ChildProfileContext.Provider>
  );
}

export function useChildProfile() {
  const ctx = useContext(ChildProfileContext);
  if (!ctx) throw new Error("useChildProfile must be used within ChildProfileProvider");
  return ctx;
}
