"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRecordFlow } from "@/lib/record-context";
import { useAuth } from "@/lib/auth-context";
import { useChildProfile } from "@/lib/child-profile-context";
import { ChevronLeftIcon, GalleryIcon } from "@/components/icons";
import { fetchPhotoImageUrl, getCase, listCases } from "@/lib/api";

// 사진을 아직 못 고른 상태에서 기록만 저장할 때 쓰는 대표 색상.
const FALLBACK_COLOR = "#e7cdb8";

export default function CameraPage() {
  const router = useRouter();
  const { accessToken, loading: authLoading } = useAuth();
  const { childProfile } = useChildProfile();
  const { setPhotoColor, setPhotoFile } = useRecordFlow();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [overlayOn, setOverlayOn] = useState(true);
  const [previousUrl, setPreviousUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  // 이전 촬영 사진을 겹쳐 보여준다 - 같은 구도로 찍어야 면적 비교가 의미를 갖는다.
  useEffect(() => {
    if (authLoading || !childProfile) return;
    let cancelled = false;
    let created: string | null = null;

    (async () => {
      try {
        const cases = await listCases(accessToken, childProfile.id);
        const newest = cases.find((c) => c.active && c.photoCount > 0);
        if (!newest) return;
        const detail = await getCase(accessToken, newest.id);
        const last = [...detail.photos].reverse().find((p) => p.hasImage);
        if (!last) return;
        const url = await fetchPhotoImageUrl(accessToken, last.id);
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        created = url;
        setPreviousUrl(url);
      } catch {
        // 이전 사진을 못 불러와도 촬영 자체는 되어야 하므로 조용히 넘어간다.
      }
    })();

    return () => {
      cancelled = true;
      if (created) URL.revokeObjectURL(created);
    };
  }, [accessToken, authLoading, childProfile]);

  // 미리보기로 만든 임시 주소는 화면을 떠날 때 정리한다(안 하면 메모리에 계속 쌓인다).
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 올릴 수 있어요.");
      return;
    }
    setError("");
    setPhotoFile(file);
    setPhotoColor(FALLBACK_COLOR);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
  }

  function proceed() {
    router.push("/record/confirm");
  }

  return (
    <div className="flex h-full flex-col bg-black text-white">
      <div className="flex h-14 shrink-0 items-center px-3">
        <Link href="/record/guide" className="flex h-9 w-9 items-center justify-center rounded-full active:bg-white/10">
          <ChevronLeftIcon className="h-5 w-5 text-white" />
        </Link>
      </div>

      <div className="relative mx-4 flex-1 overflow-hidden rounded-2xl bg-zinc-900">
        {/* 고른 사진이 있으면 그것을, 없으면 이전 촬영 사진을 흐리게 겹쳐 보여준다. */}
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- blob: 주소라 next/image로 최적화할 수 없다
          <img src={preview} alt="선택한 사진" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          overlayOn &&
          previousUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- blob: 주소라 next/image로 최적화할 수 없다
            <img
              src={previousUrl}
              alt="이전 촬영 사진"
              className="absolute inset-0 h-full w-full object-cover opacity-35"
            />
          )
        )}

        <svg className="absolute inset-0 h-full w-full opacity-40">
          <line x1="33%" y1="0" x2="33%" y2="100%" stroke="white" strokeWidth="1" />
          <line x1="66%" y1="0" x2="66%" y2="100%" stroke="white" strokeWidth="1" />
          <line x1="0" y1="33%" x2="100%" y2="33%" stroke="white" strokeWidth="1" />
          <line x1="0" y1="66%" x2="100%" y2="66%" stroke="white" strokeWidth="1" />
        </svg>

        <div className="absolute inset-x-0 top-3 flex justify-center px-4">
          <span className="rounded-full bg-black/50 px-3 py-1 text-center text-xs">
            {preview ? "사진을 확인하고 다음으로 넘어가세요" : "이전 촬영 구도에 맞춰 주세요"}
          </span>
        </div>

        {!preview && previousUrl && (
          <button
            onClick={() => setOverlayOn((v) => !v)}
            className="absolute bottom-3 right-3 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium"
          >
            이전 사진 겹쳐보기 {overlayOn ? "끄기" : "켜기"}
          </button>
        )}
      </div>

      {error && <p className="px-8 pt-3 text-center text-xs text-red-300">{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        // capture: 휴대폰에서는 갤러리 대신 후면 카메라가 바로 열린다.
        capture="environment"
        onChange={handlePick}
        className="hidden"
      />

      <div className="flex items-center justify-between px-8 py-6">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center gap-1 text-xs text-white/80"
        >
          <GalleryIcon className="h-6 w-6" />
          {preview ? "다시 고르기" : "사진 고르기"}
        </button>

        {preview ? (
          <button
            onClick={proceed}
            className="rounded-full bg-white px-6 py-3 text-sm font-bold text-black"
          >
            다음
          </button>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-4 border-white/80"
          >
            <span className="h-14 w-14 rounded-full bg-white" />
          </button>
        )}

        <button onClick={proceed} className="w-14 text-right text-xs text-white/60">
          사진 없이
        </button>
      </div>
    </div>
  );
}
