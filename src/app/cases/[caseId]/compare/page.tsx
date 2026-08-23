"use client";

import { use, useState } from "react";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { DisclaimerBanner } from "@/components/ui/Disclaimer";
import { photoRecords } from "@/lib/mock-data";

export default function ComparePage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params);
  const shots = photoRecords.filter((p) => p.caseId === caseId).sort((a, b) => (a.takenAt < b.takenAt ? -1 : 1));

  const [beforeIdx, setBeforeIdx] = useState(0);
  const [afterIdx, setAfterIdx] = useState(shots.length - 1);
  const [slider, setSlider] = useState(50);

  const before = shots[beforeIdx];
  const after = shots[afterIdx];

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="사진 비교" backHref={`/cases/${caseId}/timeline`} />

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-medium text-muted">이전 시점</label>
            <select
              value={beforeIdx}
              onChange={(e) => setBeforeIdx(Number(e.target.value))}
              className="mt-1 h-10 w-full rounded-lg border border-border bg-surface px-2 text-sm"
            >
              {shots.map((s, i) => (
                <option key={s.id} value={i}>
                  {s.takenAt} · {s.areaRatio}%
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted">이후 시점</label>
            <select
              value={afterIdx}
              onChange={(e) => setAfterIdx(Number(e.target.value))}
              className="mt-1 h-10 w-full rounded-lg border border-border bg-surface px-2 text-sm"
            >
              {shots.map((s, i) => (
                <option key={s.id} value={i}>
                  {s.takenAt} · {s.areaRatio}%
                </option>
              ))}
            </select>
          </div>
        </div>

        {before && after && (
          <>
            <div className="relative mt-4 aspect-square w-full overflow-hidden rounded-2xl">
              <div className="absolute inset-0" style={{ backgroundColor: after.imageColor }} />
              <div
                className="absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: `${slider}%`, backgroundColor: before.imageColor }}
              />
              <div
                className="absolute inset-y-0 w-0.5 bg-white shadow"
                style={{ left: `${slider}%` }}
              />
              <span className="absolute left-2 top-2 rounded-full bg-black/50 px-2 py-1 text-[11px] text-white">
                {before.takenAt}
              </span>
              <span className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-1 text-[11px] text-white">
                {after.takenAt}
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={100}
              value={slider}
              onChange={(e) => setSlider(Number(e.target.value))}
              className="mt-3 w-full accent-brand-600"
            />

            <div className="mt-3 flex items-center justify-center gap-4 text-sm">
              <span className="text-muted">{before.areaRatio}%</span>
              <span className="text-muted">→</span>
              <span className="font-bold text-foreground">{after.areaRatio}%</span>
              <span className={after.areaRatio < before.areaRatio ? "text-status-improve" : "text-status-caution"}>
                ({after.areaRatio < before.areaRatio ? "" : "+"}
                {(after.areaRatio - before.areaRatio).toFixed(1)}%p)
              </span>
            </div>
          </>
        )}

        <div className="mt-5">
          <DisclaimerBanner />
        </div>
      </div>
    </div>
  );
}
