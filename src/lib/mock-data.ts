import type {
  AppNotification,
  Case,
  ChildProfile,
  Diagnosis,
  OutbreakEntry,
  PhotoRecord,
  Prescription,
} from "./types";

export const currentChild: ChildProfile = {
  id: "child-1",
  name: "이서준",
  birthDate: "2020-11-03",
  gender: "남",
  region: { province: "대전광역시", district: "유성구" },
  avatarColor: "var(--color-accent-200)",
};

export const childProfiles: ChildProfile[] = [
  currentChild,
  {
    id: "child-2",
    name: "이서아",
    birthDate: "2023-04-18",
    gender: "여",
    region: { province: "대전광역시", district: "유성구" },
    avatarColor: "var(--color-brand-200)",
  },
];

export const cases: Case[] = [
  {
    id: "case-1",
    childId: "child-1",
    bodyPart: "팔 접히는 부위(팔오금)",
    createdAt: "2026-08-01",
    status: "호전",
    baselineAreaRatio: 12.4,
    latestAreaRatio: 5.1,
    daysObserved: 7,
    active: true,
  },
  {
    id: "case-2",
    childId: "child-1",
    bodyPart: "다리 접히는 부위(오금)",
    createdAt: "2026-07-20",
    status: "유지",
    baselineAreaRatio: 8.0,
    latestAreaRatio: 7.6,
    daysObserved: 14,
    active: true,
  },
  {
    id: "case-3",
    childId: "child-1",
    bodyPart: "몸통",
    createdAt: "2026-06-02",
    status: "확대 추세",
    baselineAreaRatio: 4.2,
    latestAreaRatio: 9.8,
    daysObserved: 5,
    active: false,
  },
];

export const photoRecords: PhotoRecord[] = [
  {
    id: "photo-1",
    caseId: "case-1",
    takenAt: "2026-08-01",
    bodyPart: "팔 접히는 부위(팔오금)",
    imageColor: "#e7cdb8",
    areaRatio: 12.4,
    signs: { erythema: 2, papulation: 2, excoriation: 1, lichenification: 1 },
  },
  {
    id: "photo-2",
    caseId: "case-1",
    takenAt: "2026-08-04",
    bodyPart: "팔 접히는 부위(팔오금)",
    imageColor: "#ead4c2",
    areaRatio: 8.2,
    signs: { erythema: 1, papulation: 1, excoriation: 1, lichenification: 1 },
  },
  {
    id: "photo-3",
    caseId: "case-1",
    takenAt: "2026-08-08",
    bodyPart: "팔 접히는 부위(팔오금)",
    imageColor: "#efdccc",
    areaRatio: 5.1,
    signs: { erythema: 1, papulation: 0, excoriation: 0, lichenification: 1 },
  },
];

export const diagnoses: Diagnosis[] = [
  {
    id: "dx-1",
    caseId: "case-1",
    date: "2026-08-01",
    hospitalName: "새싹소아청소년과",
    diagnosisName: "아토피피부염",
  },
];

export const prescriptions: Prescription[] = [
  {
    id: "rx-1",
    diagnosisId: "dx-1",
    medicationName: "타크로리무스 연고",
    form: "연고",
    durationDays: 14,
    note: "하루 2회, 얇게 도포",
    nextVisitDate: "2026-08-15",
    reminderCycleDays: 2,
  },
];

export const outbreakEntries: OutbreakEntry[] = [
  { diseaseName: "농가진", trend: "증가", changeRate: 18, region: "대전 유성구" },
  { diseaseName: "수족구병", trend: "증가", changeRate: 32, region: "대전 유성구" },
  { diseaseName: "수두", trend: "유지", changeRate: 2, region: "대전 유성구" },
  { diseaseName: "전염성 연속종", trend: "감소", changeRate: -8, region: "대전 유성구" },
];

export const notifications: AppNotification[] = [
  {
    id: "ntf-1",
    type: "리마인더",
    title: "오늘은 촬영하는 날이에요",
    body: "팔 접히는 부위 경과 관찰 — 2일 주기 촬영 알림",
    createdAt: "2026-08-14T09:00:00",
    read: false,
  },
  {
    id: "ntf-2",
    type: "변화감지",
    title: "면적 비율이 감소했어요",
    body: "이서준 · 팔 접히는 부위 — 처방 후 호전 추세로 표기되었습니다",
    createdAt: "2026-08-08T10:12:00",
    read: true,
  },
  {
    id: "ntf-3",
    type: "유행정보",
    title: "우리 지역 수족구병 신고 증가",
    body: "대전 유성구 — 최근 2주 신고 건수 32% 증가",
    createdAt: "2026-08-06T08:30:00",
    read: true,
  },
];

export const classificationResult = [
  { name: "아토피피부염", probability: 0.78, group: "염증성" as const },
  { name: "접촉성 피부염", probability: 0.14, group: "염증성" as const },
  { name: "건선", probability: 0.05, group: "염증성" as const },
];
