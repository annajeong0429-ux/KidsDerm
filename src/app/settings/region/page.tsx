"use client";

import { useState } from "react";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Button } from "@/components/ui/Button";
import { MapPinIcon } from "@/components/icons";
import { useChildProfile } from "@/lib/child-profile-context";
import { AuthGate } from "@/components/auth/AuthGate";

const PROVINCES = ["대전광역시", "서울특별시", "경기도", "부산광역시", "대구광역시"];

export default function RegionSettingsPage() {
  const { childProfile, updateChild } = useChildProfile();
  // 아이 정보는 서버에서 받아오므로 첫 렌더 때는 아직 없을 수 있다. 저장된 값을 상태로
  // 복사해두는 대신, "사용자가 고친 값이 있으면 그것, 없으면 서버 값"으로 그때그때 정한다 -
  // 이러면 아이 정보가 늦게 도착해도 입력칸이 알아서 채워진다.
  const [editedProvince, setEditedProvince] = useState<string | null>(null);
  const [editedDistrict, setEditedDistrict] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const province = editedProvince ?? childProfile?.region.province ?? PROVINCES[0];
  const district = editedDistrict ?? childProfile?.region.district ?? "";

  async function handleSave() {
    if (!childProfile) return;
    setSaving(true);
    setMessage("");
    try {
      await updateChild(childProfile.id, {
        name: childProfile.name,
        birthDate: childProfile.birthDate,
        gender: childProfile.gender,
        region: { province, district },
        avatarColor: childProfile.avatarColor,
      });
      setMessage("저장했어요.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "저장에 실패했어요.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthGate>
    <div className="flex h-full flex-col">
      <ScreenHeader title="지역 설정" backHref="/settings" />

      <div className="flex-1 space-y-4 px-6 pt-2">
        <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-200 bg-brand-50 py-3 text-sm font-semibold text-brand-700">
          <MapPinIcon className="h-4 w-4" /> 현재 위치로 설정
        </button>

        <div className="grid grid-cols-2 gap-2">
          <select
            value={province}
            onChange={(e) => setEditedProvince(e.target.value)}
            className="h-12 rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-brand-500"
          >
            {PROVINCES.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <input
            value={district}
            onChange={(e) => setEditedDistrict(e.target.value)}
            placeholder="시군구"
            className="h-12 rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-brand-500"
          />
        </div>

        <p className="text-xs leading-relaxed text-muted">
          여기서 설정한 거주 지역은 질병관리청 감염병 발생현황 조회 기준으로 사용돼요. 지역을
          변경하면 홈과 분석 결과의 유행 정보도 함께 바뀝니다.
        </p>
      </div>

      <div className="px-6 pb-6 pt-3">
        {message && <p className="mb-2 text-center text-sm text-muted">{message}</p>}
        <Button fullWidth size="lg" onClick={handleSave} disabled={saving || !childProfile}>
          {saving ? "저장 중..." : "저장"}
        </Button>
      </div>
    </div>
    </AuthGate>
  );
}
