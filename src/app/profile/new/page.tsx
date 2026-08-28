"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { UserIcon } from "@/components/icons";
import { useChildProfile } from "@/lib/child-profile-context";

const PROVINCES = ["대전광역시", "서울특별시", "경기도", "부산광역시", "대구광역시"];
const AVATAR_COLORS = ["var(--color-accent-200)", "var(--color-brand-200)", "#f5c26b", "#8ec7d2"];

export default function NewProfilePage() {
  const router = useRouter();
  const { createChild } = useChildProfile();
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<"남" | "여">("남");
  const [province, setProvince] = useState(PROVINCES[0]);
  const [district, setDistrict] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await createChild({
        name,
        birthDate,
        gender,
        region: { province, district },
        avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      });
      router.push("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "등록에 실패했어요. 잠시 후 다시 시도해 주세요.");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="아이 프로필 등록" backHref="/signup/terms" />

      <form className="flex flex-1 flex-col overflow-y-auto px-6 pt-2 pb-6" onSubmit={handleSubmit}>
        <div className="flex justify-center py-4">
          <button
            type="button"
            className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-border bg-canvas"
          >
            <UserIcon className="h-9 w-9 text-muted" />
          </button>
        </div>

        <label className="text-sm font-medium text-foreground">아이 이름</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름을 입력해 주세요"
          className="mt-1.5 h-12 rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-brand-500"
        />

        <label className="mt-4 text-sm font-medium text-foreground">생년월일</label>
        <input
          type="date"
          required
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="mt-1.5 h-12 rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-brand-500"
        />

        <span className="mt-4 text-sm font-medium text-foreground">성별</span>
        <div className="mt-1.5 grid grid-cols-2 gap-2">
          {(["남", "여"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGender(g)}
              className={`h-11 rounded-xl border text-sm font-semibold transition-colors ${
                gender === g ? "border-brand-600 bg-brand-50 text-brand-700" : "border-border text-muted"
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        <label className="mt-4 text-sm font-medium text-foreground">거주 지역</label>
        <div className="mt-1.5 grid grid-cols-2 gap-2">
          <select
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="h-12 rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-brand-500"
          >
            {PROVINCES.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <input
            required
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            placeholder="시군구 (예: 유성구)"
            className="h-12 rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-brand-500"
          />
        </div>
        <p className="mt-1.5 text-xs text-muted">
          거주 지역은 질병관리청 감염병 발생현황 조회 기준으로 사용돼요
        </p>

        {error && <p className="mt-4 text-sm text-status-caution">{error}</p>}

        <Button type="submit" fullWidth size="lg" className="mt-8" disabled={submitting}>
          {submitting ? "등록 중..." : "등록 완료"}
        </Button>
      </form>
    </div>
  );
}
