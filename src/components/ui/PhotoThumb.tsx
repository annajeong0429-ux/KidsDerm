"use client";

import { useEffect, useState } from "react";
import { fetchPhotoImageUrl, type PhotoRecordWithSymptoms } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

/**
 * 촬영 사진 썸네일.
 *
 * 사진 조회에는 로그인 토큰이 필요한데 <img src="...">는 헤더를 붙여주지 못한다.
 * 그래서 직접 받아와 임시 blob 주소로 바꿔 띄우고, 화면을 떠날 때 정리한다.
 * 사진이 아직 없거나 불러오기에 실패하면 대표 색상 사각형으로 대체한다.
 */
export function PhotoThumb({
  photo,
  className = "",
}: {
  photo: Pick<PhotoRecordWithSymptoms, "id" | "imageColor" | "hasImage">;
  className?: string;
}) {
  const { accessToken } = useAuth();
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!photo.hasImage) return;
    let cancelled = false;
    let created: string | null = null;

    fetchPhotoImageUrl(accessToken, photo.id)
      .then((objectUrl) => {
        if (cancelled) {
          URL.revokeObjectURL(objectUrl);
          return;
        }
        created = objectUrl;
        setUrl(objectUrl);
      })
      .catch(() => {
        // 실패하면 아래 색상 사각형이 그대로 보인다.
      });

    return () => {
      cancelled = true;
      if (created) URL.revokeObjectURL(created);
    };
  }, [accessToken, photo.id, photo.hasImage]);

  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- blob: 주소라 next/image로 최적화할 수 없다
      <img src={url} alt="촬영 사진" className={`object-cover ${className}`} />
    );
  }

  return <span className={className} style={{ backgroundColor: photo.imageColor }} />;
}
