"use client";

import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

interface MedicalFlowState {
  /** 이 진료가 어느 관찰 사례에 대한 것인지. 저장하려면 반드시 있어야 한다. */
  caseId: string;
  // 사례 목록을 받아온 뒤 "아직 안 골랐으면 첫 사례로" 채우는 곳이 있어서,
  // 이전 값을 보고 정할 수 있는 React 표준 setter 형태를 그대로 노출한다.
  setCaseId: Dispatch<SetStateAction<string>>;
  visitDate: string;
  setVisitDate: (v: string) => void;
  hospitalName: string;
  setHospitalName: (v: string) => void;
  diagnosisName: string;
  setDiagnosisName: (v: string) => void;
  medicationName: string;
  setMedicationName: (v: string) => void;
  form: "연고" | "경구" | "기타";
  setForm: (v: "연고" | "경구" | "기타") => void;
  durationDays: number;
  setDurationDays: (v: number) => void;
  note: string;
  setNote: (v: string) => void;
  nextVisitDate: string;
  setNextVisitDate: (v: string) => void;
  reminderCycleDays: 1 | 2 | 3;
  setReminderCycleDays: (v: 1 | 2 | 3) => void;
  reminderOn: boolean;
  setReminderOn: (v: boolean) => void;
}

const MedicalFlowContext = createContext<MedicalFlowState | null>(null);

export function MedicalFlowProvider({ children }: { children: ReactNode }) {
  const [caseId, setCaseId] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [diagnosisName, setDiagnosisName] = useState("");
  const [medicationName, setMedicationName] = useState("");
  const [form, setForm] = useState<"연고" | "경구" | "기타">("연고");
  const [durationDays, setDurationDays] = useState(14);
  const [note, setNote] = useState("");
  const [nextVisitDate, setNextVisitDate] = useState("");
  const [reminderCycleDays, setReminderCycleDays] = useState<1 | 2 | 3>(2);
  const [reminderOn, setReminderOn] = useState(true);

  return (
    <MedicalFlowContext.Provider
      value={{
        caseId,
        setCaseId,
        visitDate,
        setVisitDate,
        hospitalName,
        setHospitalName,
        diagnosisName,
        setDiagnosisName,
        medicationName,
        setMedicationName,
        form,
        setForm,
        durationDays,
        setDurationDays,
        note,
        setNote,
        nextVisitDate,
        setNextVisitDate,
        reminderCycleDays,
        setReminderCycleDays,
        reminderOn,
        setReminderOn,
      }}
    >
      {children}
    </MedicalFlowContext.Provider>
  );
}

export function useMedicalFlow() {
  const ctx = useContext(MedicalFlowContext);
  if (!ctx) throw new Error("useMedicalFlow must be used within MedicalFlowProvider");
  return ctx;
}
