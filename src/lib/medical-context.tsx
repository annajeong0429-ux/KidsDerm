"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface MedicalFlowState {
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
