/**
 * 백엔드 도메인 API 호출을 한 곳에 모아둔 파일.
 *
 * 백엔드는 snake_case(예: area_ratio), 프론트엔드는 camelCase(예: areaRatio)를 쓴다.
 * 그 변환을 화면마다 반복하지 않도록, 이 파일에서만 변환하고 화면에는 기존 타입 그대로 넘긴다.
 * 그래서 화면 코드는 "백엔드가 어떤 모양으로 주는지" 몰라도 된다.
 */

import type { BodyPart, Case, ChildProfile, Diagnosis, PhotoRecord, Prescription, SymptomEntry } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string,
  ) {
    super(detail);
  }
}

async function request<T>(
  path: string,
  { method = "GET", body, token }: { method?: string; body?: unknown; token: string | null },
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let detail = "요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.";
    try {
      const parsed = await res.json();
      if (typeof parsed.detail === "string") detail = parsed.detail;
    } catch {
      // 응답 본문이 비어있거나 JSON이 아니면 위의 기본 문구를 그대로 쓴다.
    }
    throw new ApiError(res.status, detail);
  }

  // 204 No Content(삭제 등)는 본문이 없다.
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/* ---------------------------------- 아이 프로필 ---------------------------------- */

interface ChildProfileDto {
  id: number;
  name: string;
  birth_date: string;
  gender: string;
  region: { province: string; district: string };
  avatar_color: string;
}

function toChildProfile(dto: ChildProfileDto): ChildProfile {
  return {
    id: String(dto.id),
    name: dto.name,
    birthDate: dto.birth_date,
    gender: dto.gender as ChildProfile["gender"],
    region: dto.region,
    avatarColor: dto.avatar_color,
  };
}

export interface ChildProfileInput {
  name: string;
  birthDate: string;
  gender: "남" | "여";
  region: { province: string; district: string };
  avatarColor: string;
}

function fromChildProfileInput(input: ChildProfileInput) {
  return {
    name: input.name,
    birth_date: input.birthDate,
    gender: input.gender,
    region: input.region,
    avatar_color: input.avatarColor,
  };
}

export async function listChildren(token: string | null): Promise<ChildProfile[]> {
  const dtos = await request<ChildProfileDto[]>("/children", { token });
  return dtos.map(toChildProfile);
}

export async function createChild(token: string | null, input: ChildProfileInput): Promise<ChildProfile> {
  const dto = await request<ChildProfileDto>("/children", {
    method: "POST",
    body: fromChildProfileInput(input),
    token,
  });
  return toChildProfile(dto);
}

export async function updateChild(
  token: string | null,
  childId: string,
  input: ChildProfileInput,
): Promise<ChildProfile> {
  const dto = await request<ChildProfileDto>(`/children/${childId}`, {
    method: "PUT",
    body: fromChildProfileInput(input),
    token,
  });
  return toChildProfile(dto);
}

export async function deleteChild(token: string | null, childId: string): Promise<void> {
  await request<void>(`/children/${childId}`, { method: "DELETE", token });
}

/* ------------------------------------ 사례 ------------------------------------ */

interface CaseDto {
  id: number;
  child_id: number;
  body_part: string;
  body_part_detail: string | null;
  created_at: string;
  active: boolean;
  status: string;
  baseline_area_ratio: number;
  latest_area_ratio: number;
  days_observed: number;
  photo_count: number;
}

/** 사례 요약에 사진 장수를 얹은 것. 화면에서 "아직 사진이 없는 사례"를 구분할 때 쓴다. */
export type CaseSummary = Case & { photoCount: number; bodyPartDetail: string | null };

function toCase(dto: CaseDto): CaseSummary {
  return {
    id: String(dto.id),
    childId: String(dto.child_id),
    bodyPart: dto.body_part as BodyPart,
    bodyPartDetail: dto.body_part_detail,
    createdAt: dto.created_at.slice(0, 10),
    status: dto.status as Case["status"],
    baselineAreaRatio: dto.baseline_area_ratio,
    latestAreaRatio: dto.latest_area_ratio,
    daysObserved: dto.days_observed,
    active: dto.active,
    photoCount: dto.photo_count,
  };
}

interface SymptomDto {
  id: number;
  itching: number;
  oozing: number;
  pain: number;
  fever_celsius: number;
  new_lesion: boolean;
  memo: string | null;
  onset_timing: string;
  onset_timing_detail: string | null;
  distribution: string;
}

interface PhotoRecordDto {
  id: number;
  case_id: number;
  taken_at: string;
  image_color: string;
  has_image: boolean;
  area_ratio: number;
  signs: { erythema: number; papulation: number; excoriation: number; lichenification: number };
  symptoms: SymptomDto | null;
}

/** 사진 기록에 그때 같이 적은 자가보고 증상을 붙인 것. */
export type PhotoRecordWithSymptoms = PhotoRecord & {
  symptoms: SymptomEntry | null;
  /** 실제 사진 파일이 올라와 있는지. true면 fetchPhotoImageUrl로 불러올 수 있다. */
  hasImage: boolean;
};

function toPhotoRecord(dto: PhotoRecordDto, bodyPart: BodyPart): PhotoRecordWithSymptoms {
  return {
    id: String(dto.id),
    caseId: String(dto.case_id),
    takenAt: dto.taken_at.slice(0, 10),
    bodyPart,
    imageColor: dto.image_color,
    hasImage: dto.has_image,
    areaRatio: dto.area_ratio,
    signs: dto.signs,
    symptoms: dto.symptoms
      ? {
          itching: dto.symptoms.itching,
          oozing: dto.symptoms.oozing,
          pain: dto.symptoms.pain,
          fever: dto.symptoms.fever_celsius,
          newLesion: dto.symptoms.new_lesion,
          memo: dto.symptoms.memo ?? undefined,
        }
      : null,
  };
}

export async function listCases(token: string | null, childId?: string): Promise<CaseSummary[]> {
  const query = childId ? `?child_id=${childId}` : "";
  const dtos = await request<CaseDto[]>(`/cases${query}`, { token });
  return dtos.map(toCase);
}

export interface CaseDetail {
  case: CaseSummary;
  photos: PhotoRecordWithSymptoms[];
}

export async function getCase(token: string | null, caseId: string): Promise<CaseDetail> {
  const dto = await request<CaseDto & { photos: PhotoRecordDto[] }>(`/cases/${caseId}`, { token });
  const summary = toCase(dto);
  return { case: summary, photos: dto.photos.map((p) => toPhotoRecord(p, summary.bodyPart)) };
}

export async function setCaseActive(token: string | null, caseId: string, active: boolean): Promise<CaseSummary> {
  const dto = await request<CaseDto>(`/cases/${caseId}`, { method: "PATCH", body: { active }, token });
  return toCase(dto);
}

export async function deleteCase(token: string | null, caseId: string): Promise<void> {
  await request<void>(`/cases/${caseId}`, { method: "DELETE", token });
}

/* ---------------------------------- 촬영 기록 저장 ---------------------------------- */

export interface RecordInput {
  bodyPart: string;
  bodyPartDetail?: string | null;
  imageColor: string;
  areaRatio: number;
  signs: { erythema: number; papulation: number; excoriation: number; lichenification: number };
  symptoms: SymptomEntry;
  onsetTiming: string;
  onsetTimingDetail?: string | null;
  distribution: "단일" | "부분" | "광범위";
}

export interface RecordCreated {
  case: CaseSummary;
  photo: PhotoRecordWithSymptoms;
  caseCreated: boolean;
}

export async function createRecord(
  token: string | null,
  childId: string,
  input: RecordInput,
): Promise<RecordCreated> {
  const dto = await request<{ case: CaseDto; photo: PhotoRecordDto; case_created: boolean }>(
    `/children/${childId}/records`,
    {
      method: "POST",
      body: {
        body_part: input.bodyPart,
        body_part_detail: input.bodyPartDetail || null,
        image_color: input.imageColor,
        area_ratio: input.areaRatio,
        signs: input.signs,
        symptoms: {
          itching: input.symptoms.itching,
          oozing: input.symptoms.oozing,
          pain: input.symptoms.pain,
          fever_celsius: input.symptoms.fever,
          new_lesion: input.symptoms.newLesion,
          memo: input.symptoms.memo || null,
          onset_timing: input.onsetTiming,
          onset_timing_detail: input.onsetTimingDetail || null,
          distribution: input.distribution,
        },
      },
      token,
    },
  );
  const summary = toCase(dto.case);
  return { case: summary, photo: toPhotoRecord(dto.photo, summary.bodyPart), caseCreated: dto.case_created };
}

/* ---------------------------------- 진단 / 처방 ---------------------------------- */

interface PrescriptionDto {
  id: number;
  diagnosis_id: number;
  medication_name: string;
  form: string;
  duration_days: number;
  note: string | null;
  next_visit_date: string | null;
  reminder_cycle_days: number;
  reminder_on: boolean;
}

interface DiagnosisDto {
  id: number;
  case_id: number;
  visited_on: string;
  hospital_name: string;
  diagnosis_name: string;
  prescriptions: PrescriptionDto[];
}

export type DiagnosisWithPrescriptions = Diagnosis & { prescriptions: Prescription[] };

function toDiagnosis(dto: DiagnosisDto): DiagnosisWithPrescriptions {
  return {
    id: String(dto.id),
    caseId: String(dto.case_id),
    date: dto.visited_on,
    hospitalName: dto.hospital_name,
    diagnosisName: dto.diagnosis_name,
    prescriptions: dto.prescriptions.map((p) => ({
      id: String(p.id),
      diagnosisId: String(p.diagnosis_id),
      medicationName: p.medication_name,
      form: p.form as Prescription["form"],
      durationDays: p.duration_days,
      note: p.note ?? undefined,
      nextVisitDate: p.next_visit_date ?? "",
      reminderCycleDays: p.reminder_cycle_days as Prescription["reminderCycleDays"],
    })),
  };
}

export async function listDiagnoses(token: string | null, caseId: string): Promise<DiagnosisWithPrescriptions[]> {
  const dtos = await request<DiagnosisDto[]>(`/cases/${caseId}/diagnoses`, { token });
  return dtos.map(toDiagnosis);
}

export interface DiagnosisInput {
  visitDate: string;
  hospitalName: string;
  diagnosisName: string;
  prescriptions: {
    medicationName: string;
    form: "연고" | "경구" | "기타";
    durationDays: number;
    note?: string;
    nextVisitDate?: string;
    reminderCycleDays: 1 | 2 | 3;
    reminderOn: boolean;
  }[];
}

export async function createDiagnosis(
  token: string | null,
  caseId: string,
  input: DiagnosisInput,
): Promise<DiagnosisWithPrescriptions> {
  const dto = await request<DiagnosisDto>(`/cases/${caseId}/diagnoses`, {
    method: "POST",
    body: {
      visited_on: input.visitDate,
      hospital_name: input.hospitalName,
      diagnosis_name: input.diagnosisName,
      prescriptions: input.prescriptions.map((p) => ({
        medication_name: p.medicationName,
        form: p.form,
        duration_days: p.durationDays,
        note: p.note || null,
        next_visit_date: p.nextVisitDate || null,
        reminder_cycle_days: p.reminderCycleDays,
        reminder_on: p.reminderOn,
      })),
    },
    token,
  });
  return toDiagnosis(dto);
}

/* ---------------------------------- 사진 파일 ---------------------------------- */

/** 촬영 기록에 실제 사진 파일을 올린다. 기록을 먼저 만든 뒤에 호출한다. */
export async function uploadPhotoImage(token: string | null, photoId: string, file: File): Promise<void> {
  const form = new FormData();
  form.append("image", file);
  // FormData를 보낼 때는 Content-Type을 직접 지정하면 안 된다 -
  // 브라우저가 경계문자(boundary)를 포함해 알아서 붙여야 서버가 파싱할 수 있다.
  const res = await fetch(`${API_BASE}/photos/${photoId}/image`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  if (!res.ok) {
    let detail = "사진을 올리지 못했어요.";
    try {
      const parsed = await res.json();
      if (typeof parsed.detail === "string") detail = parsed.detail;
    } catch {
      // 본문이 없으면 기본 문구를 쓴다.
    }
    throw new ApiError(res.status, detail);
  }
}

/**
 * 사진을 내려받아 화면에 띄울 수 있는 임시 주소로 바꿔준다.
 *
 * <img src="...">에 API 주소를 그대로 넣을 수 없다 - 사진 조회에는 로그인 토큰이
 * 필요한데 img 태그는 Authorization 헤더를 붙여주지 못하기 때문이다.
 * 그래서 직접 받아온 뒤 blob 주소로 만들어 넘긴다.
 *
 * 다 쓰고 나면 반드시 URL.revokeObjectURL()로 정리해야 메모리에 쌓이지 않는다.
 */
export async function fetchPhotoImageUrl(token: string | null, photoId: string): Promise<string> {
  const res = await fetch(`${API_BASE}/photos/${photoId}/image`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new ApiError(res.status, "사진을 불러오지 못했어요.");
  return URL.createObjectURL(await res.blob());
}

/* ---------------------------------- 리포트 PDF ---------------------------------- */

export type ReportSection = "photos" | "graph" | "symptoms" | "prescription";

/** 진료용 리포트 PDF를 받아 파일과 파일명을 돌려준다. */
export async function fetchReportPdf(
  token: string | null,
  caseId: string,
  sections: ReportSection[],
): Promise<{ blob: Blob; filename: string }> {
  const query = sections.map((s) => `sections=${s}`).join("&");
  const res = await fetch(`${API_BASE}/cases/${caseId}/report.pdf${query ? `?${query}` : ""}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new ApiError(res.status, "리포트를 만들지 못했어요.");

  // 서버가 Content-Disposition에 담아 보낸 파일명을 꺼내 쓴다.
  const disposition = res.headers.get("Content-Disposition") ?? "";
  const match = /filename\*=UTF-8''([^;]+)/.exec(disposition);
  const filename = match ? decodeURIComponent(match[1]) : "kidsderm-report.pdf";
  return { blob: await res.blob(), filename };
}
