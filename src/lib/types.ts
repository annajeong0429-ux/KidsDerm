export type BodyPart =
  | "얼굴"
  | "목"
  | "팔 접히는 부위(팔오금)"
  | "다리 접히는 부위(오금)"
  | "몸통"
  | "손·발";

export type TrendStatus = "호전" | "유지" | "확대 추세";

export type DiseaseGroup = "염증성" | "선천성" | "감염성" | "기타";

export interface ClassificationCandidate {
  name: string;
  probability: number; // 0~1
  group: DiseaseGroup;
}

export interface SeaseFourSigns {
  erythema: number; // 홍반 0~3
  papulation: number; // 구진 0~3
  excoriation: number; // 긁은 자국 0~3
  lichenification: number; // 태선화 0~3
}

export interface PhotoRecord {
  id: string;
  caseId: string;
  takenAt: string; // ISO date
  bodyPart: BodyPart;
  imageColor: string; // placeholder swatch color for mock thumbnail
  areaRatio: number; // 0~100 (%)
  signs: SeaseFourSigns;
  classification?: ClassificationCandidate[];
}

export interface SymptomEntry {
  itching: number;
  oozing: number;
  pain: number;
  fever: number;
  newLesion: boolean;
  memo?: string;
}

export interface Diagnosis {
  id: string;
  caseId: string;
  date: string;
  hospitalName: string;
  diagnosisName: string;
}

export interface Prescription {
  id: string;
  diagnosisId: string;
  medicationName: string;
  form: "연고" | "경구" | "기타";
  durationDays: number;
  note?: string;
  nextVisitDate: string;
  reminderCycleDays: 1 | 2 | 3;
}

export interface ChildProfile {
  id: string;
  name: string;
  birthDate: string;
  gender: "남" | "여";
  region: { province: string; district: string };
  avatarColor: string;
}

export interface Case {
  id: string;
  childId: string;
  bodyPart: BodyPart;
  createdAt: string;
  status: TrendStatus;
  baselineAreaRatio: number;
  latestAreaRatio: number;
  daysObserved: number;
  active: boolean;
}

export interface OutbreakEntry {
  diseaseName: string;
  trend: "증가" | "유지" | "감소";
  changeRate: number; // %
  region: string;
}

export interface AppNotification {
  id: string;
  type: "리마인더" | "변화감지" | "유행정보";
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}
