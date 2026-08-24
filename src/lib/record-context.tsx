"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { BodyPart, SeaseFourSigns, SymptomEntry } from "./types";

// "기타"는 정해진 부위 목록에 없을 때 부모가 직접 이름을 적는 특수 값 - 도메인 전반에서
// 쓰는 BodyPart 타입은 건드리지 않고, 이 촬영 흐름 상태에서만 폭을 넓혀 쓴다.
export type BodyPartSelection = BodyPart | "기타";

interface RecordFlowState {
  bodyPart: BodyPartSelection | null;
  setBodyPart: (b: BodyPartSelection) => void;
  bodyPartDetail: string;
  setBodyPartDetail: (v: string) => void;
  photoColor: string | null;
  setPhotoColor: (c: string) => void;
  areaRatio: number;
  signs: SeaseFourSigns;
  symptoms: SymptomEntry;
  setSymptoms: (s: SymptomEntry) => void;
  onsetTiming: string;
  setOnsetTiming: (v: string) => void;
  onsetTimingDetail: string;
  setOnsetTimingDetail: (v: string) => void;
  distribution: "단일" | "부분" | "광범위";
  setDistribution: (v: "단일" | "부분" | "광범위") => void;
}

const RecordFlowContext = createContext<RecordFlowState | null>(null);

// 1(없음)~5(매우 심함) - 자가보고 증상 5단계 스케일의 기본값(가장 낮은 단계)이다.
const defaultSymptoms: SymptomEntry = {
  itching: 1,
  oozing: 1,
  pain: 1,
  fever: 1,
  newLesion: false,
  memo: "",
};

// Mock inference result for the freshly captured photo — stands in for the
// segmentation + 4-sign regression head until the real model is wired up.
const MOCK_AREA_RATIO = 9.6;
const MOCK_SIGNS: SeaseFourSigns = { erythema: 2, papulation: 1, excoriation: 1, lichenification: 0 };

export function RecordFlowProvider({ children }: { children: ReactNode }) {
  const [bodyPart, setBodyPart] = useState<BodyPartSelection | null>(null);
  const [bodyPartDetail, setBodyPartDetail] = useState("");
  const [photoColor, setPhotoColor] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState<SymptomEntry>(defaultSymptoms);
  const [onsetTiming, setOnsetTiming] = useState("");
  const [onsetTimingDetail, setOnsetTimingDetail] = useState("");
  const [distribution, setDistribution] = useState<"단일" | "부분" | "광범위">("단일");

  return (
    <RecordFlowContext.Provider
      value={{
        bodyPart,
        setBodyPart,
        bodyPartDetail,
        setBodyPartDetail,
        photoColor,
        setPhotoColor,
        areaRatio: MOCK_AREA_RATIO,
        signs: MOCK_SIGNS,
        symptoms,
        setSymptoms,
        onsetTiming,
        setOnsetTiming,
        onsetTimingDetail,
        setOnsetTimingDetail,
        distribution,
        setDistribution,
      }}
    >
      {children}
    </RecordFlowContext.Provider>
  );
}

export function useRecordFlow() {
  const ctx = useContext(RecordFlowContext);
  if (!ctx) throw new Error("useRecordFlow must be used within RecordFlowProvider");
  return ctx;
}
