"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Button } from "@/components/ui/Button";
import { useRecordFlow } from "@/lib/record-context";
import { CheckIcon } from "@/components/icons";

const ALBUM = [
  { id: 1, color: "#e7cdb8", takenAt: "2026.08.14 09:12" },
  { id: 2, color: "#ead4c2", takenAt: "2026.08.13 19:40" },
  { id: 3, color: "#efdccc", takenAt: "2026.08.13 08:05" },
  { id: 4, color: "#dfc0a2", takenAt: "2026.08.12 20:11" },
  { id: 5, color: "#e3c7ae", takenAt: "2026.08.11 21:30" },
  { id: 6, color: "#f2e2d3", takenAt: "2026.08.10 07:52" },
];

export default function GalleryPage() {
  const router = useRouter();
  const { setPhotoColor } = useRecordFlow();
  const [selected, setSelected] = useState<number | null>(null);

  const selectedItem = ALBUM.find((a) => a.id === selected);

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="갤러리에서 선택" backHref="/record/camera" />

      <div className="flex-1 overflow-y-auto px-4 pb-3">
        <div className="grid grid-cols-3 gap-1.5">
          {ALBUM.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelected(item.id)}
              className="relative aspect-square overflow-hidden rounded-lg"
            >
              <span className="absolute inset-0" style={{ backgroundColor: item.color }} />
              <span className="absolute inset-x-1 bottom-1 rounded bg-black/45 px-1 py-0.5 text-[9px] text-white">
                {item.takenAt.slice(5, 10)}
              </span>
              {selected === item.id && (
                <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600">
                  <CheckIcon className="h-3 w-3 text-white" />
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2 border-t border-border px-6 py-4">
        {selectedItem && (
          <p className="text-xs text-muted">촬영일시 자동 인식: {selectedItem.takenAt}</p>
        )}
        <Button
          fullWidth
          size="lg"
          disabled={!selectedItem}
          onClick={() => {
            if (!selectedItem) return;
            setPhotoColor(selectedItem.color);
            router.push("/record/confirm");
          }}
        >
          이 사진 사용하기
        </Button>
      </div>
    </div>
  );
}
