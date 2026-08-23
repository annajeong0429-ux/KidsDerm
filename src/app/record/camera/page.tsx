"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRecordFlow } from "@/lib/record-context";
import { ChevronLeftIcon, GalleryIcon } from "@/components/icons";
import { photoRecords } from "@/lib/mock-data";

const PHOTO_PALETTE = ["#efdccc", "#e7cdb8", "#ead4c2", "#e3c7ae"];

export default function CameraPage() {
  const router = useRouter();
  const { setPhotoColor } = useRecordFlow();
  const [overlayOn, setOverlayOn] = useState(true);
  const previousPhoto = photoRecords[photoRecords.length - 1];

  function capture() {
    const color = PHOTO_PALETTE[Math.floor(Math.random() * PHOTO_PALETTE.length)];
    setPhotoColor(color);
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
        {overlayOn && (
          <div
            className="absolute inset-0 opacity-35"
            style={{ backgroundColor: previousPhoto.imageColor }}
          />
        )}
        <svg className="absolute inset-0 h-full w-full opacity-40">
          <line x1="33%" y1="0" x2="33%" y2="100%" stroke="white" strokeWidth="1" />
          <line x1="66%" y1="0" x2="66%" y2="100%" stroke="white" strokeWidth="1" />
          <line x1="0" y1="33%" x2="100%" y2="33%" stroke="white" strokeWidth="1" />
          <line x1="0" y1="66%" x2="100%" y2="66%" stroke="white" strokeWidth="1" />
        </svg>
        <div className="absolute inset-x-0 top-3 flex justify-center">
          <span className="rounded-full bg-black/50 px-3 py-1 text-xs">
            팔 접히는 부위 · 이전 촬영 구도에 맞춰 주세요
          </span>
        </div>
        <button
          onClick={() => setOverlayOn((v) => !v)}
          className="absolute bottom-3 right-3 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium"
        >
          이전 사진 겹쳐보기 {overlayOn ? "끄기" : "켜기"}
        </button>
      </div>

      <div className="flex items-center justify-between px-8 py-6">
        <Link href="/record/gallery" className="flex flex-col items-center gap-1 text-xs text-white/80">
          <GalleryIcon className="h-6 w-6" />
          갤러리
        </Link>
        <button
          onClick={capture}
          className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-4 border-white/80"
        >
          <span className="h-14 w-14 rounded-full bg-white" />
        </button>
        <span className="w-6" />
      </div>
    </div>
  );
}
