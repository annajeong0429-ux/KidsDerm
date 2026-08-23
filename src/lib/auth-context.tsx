"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

// refresh_token은 한 번 쓰면 로테이션되어 즉시 무효화되는 일회용 토큰이다. React 개발 모드의
// StrictMode는 컴포넌트를 마운트→언마운트→재마운트하며 effect를 두 번 태우는데, 이때마다
// 새 컴포넌트 인스턴스(그리고 새 useRef)가 만들어지므로 컴포넌트 안의 가드로는 못 막는다 -
// 모듈 스코프(리마운트돼도 그대로 유지됨)에 최초 1회의 요청 Promise를 캐싱해서, 페이지가
// 실제로 새로고침되기 전까지는 몇 번을 마운트하든 네트워크 요청이 정확히 한 번만 나가게 한다.
let initialRefreshPromise: Promise<{ access_token: string } | null> | null = null;

function refreshOnce(): Promise<{ access_token: string } | null> {
  if (!initialRefreshPromise) {
    initialRefreshPromise = fetch(`${API_BASE}/auth/token/refresh`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .catch(() => null);
  }
  return initialRefreshPromise;
}

interface AuthUser {
  id: number;
  email: string;
}

interface SignupConsents {
  termsAgreed: boolean;
  healthInfoAgreed: boolean;
  marketingAgreed?: boolean;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, consents: SignupConsents) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

class ApiError extends Error {
  constructor(public detail: string) {
    super(detail);
  }
}

async function parseErrorDetail(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body.detail === "string") return body.detail;
    return "요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.";
  } catch {
    return "요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.";
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchMe(token: string) {
    const res = await fetch(`${API_BASE}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return (await res.json()) as AuthUser;
  }

  // 새로고침·재접속 시: refresh_token(httpOnly 쿠키)이 아직 살아있으면 조용히 로그인 상태를 복원한다.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await refreshOnce();
      if (cancelled) return;
      if (result) {
        setAccessToken(result.access_token);
        setUser(await fetchMe(result.access_token));
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new ApiError(await parseErrorDetail(res));
    const { access_token } = await res.json();
    setAccessToken(access_token);
    setUser(await fetchMe(access_token));
  }

  async function signup(email: string, password: string, consents: SignupConsents) {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        terms_agreed: consents.termsAgreed,
        health_info_agreed: consents.healthInfoAgreed,
        marketing_agreed: consents.marketingAgreed ?? false,
      }),
    });
    if (!res.ok) throw new ApiError(await parseErrorDetail(res));
    // 회원가입 API는 토큰을 안 돌려주므로(실제 서비스와 동일한 설계), 곧바로 같은 자격증명으로 로그인한다.
    await login(email, password);
  }

  async function logout() {
    await fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" });
    setAccessToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/**
 * 로그인이 꼭 필요한 화면(기록 입력, 진단 입력, 내 사례 보기 등)에서 쓴다. 로그인 여부를
 * 아직 확인 중이면(loading) 아무 것도 안 하고 기다리고, 확인이 끝났는데 로그인 안 돼 있으면
 * 지금 있던 경로를 ?redirect=로 붙여서 로그인 화면으로 보낸다 - 로그인 후 원래 보려던
 * 화면으로 자동 복귀시키기 위해서다.
 */
export function useRequireAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, pathname, router]);

  return { user, loading };
}

export { ApiError };
