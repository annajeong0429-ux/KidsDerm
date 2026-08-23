"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { BodyPart, SeaseFourSigns, SymptomEntry } from "./types";

interface RecordFlowState {
  bodyPart: BodyPart | null;
  setBodyPart: (b: BodyPart) => void;
  photoColor: string | null;
  setPhotoColor: (c: string) => void;
  areaRatio: number;
  signs: SeaseFourSigns;
  symptoms: SymptomEntry;
  setSymptoms: (s: SymptomEntry) => void;
  onsetTiming: string;
  setOnsetTiming: (v: string) => void;
  distribution: "단일" | "부분" | "광범위";
  setDistribution: (v: "단일" | "부분" | "광범위") => void;
}

const RecordFlowContext = createContext<RecordFlowState | null>(null);

const defaultSymptoms: SymptomEntry = {
  itching: 0,
  oozing: 0,
  pain: 0,
  fever: 0,
  newLesion: false,
  memo: "",
};

// Mock inference result for the freshly captured photo — stands in for the
// segmentation + 4-sign regression head until the real model is wired up.
const MOCK_AREA_RATIO = 9.6;
const MOCK_SIGNS: SeaseFourSigns = { erythema: 2, papulation: 1, excoriation: 1, lichenification: 0 };

export function RecordFlowProvider({ children }: { children: ReactNode }) {
  const [bodyPart, setBodyPart] = useState<BodyPart | null>(null);
  const [photoColor, setPhotoColor] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState<SymptomEntry>(defaultSymptoms);
  const [onsetTiming, setOnsetTiming] = useState("");
  const [distribution, setDistribution] = useState<"단일" | "부분" | "광범위">("단일");

  return (
    <RecordFlowContext.Provider
      value={{
        bodyPart,
        setBodyPart,
        photoColor,
        setPhotoColor,
        areaRatio: MOCK_AREA_RATIO,
        signs: MOCK_SIGNS,
        symptoms,
        setSymptoms,
        onsetTiming,
        setOnsetTiming,
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
