from datetime import date
from typing import Annotated, Literal

from pydantic import BaseModel, Field

from app.models.medical import Diagnosis, Prescription


class PrescriptionCreateRequest(BaseModel):
    medication_name: Annotated[str, Field(description="약 이름", min_length=1, max_length=60)]
    form: Annotated[Literal["연고", "경구", "기타"], Field(description="제형")]
    duration_days: Annotated[int, Field(description="복용/도포 기간(일)", ge=1, le=365)]
    note: Annotated[str | None, Field(None, description="용법 메모 (예: 하루 2회 얇게 도포)", max_length=200)]
    next_visit_date: Annotated[date | None, Field(None, description="다음 진료 예정일")]
    reminder_cycle_days: Annotated[Literal[1, 2, 3], Field(2, description="촬영 리마인더 주기(일)")]
    reminder_on: Annotated[bool, Field(True, description="리마인더를 받을지 여부")]


class DiagnosisCreateRequest(BaseModel):
    """진료 한 번의 결과를 한 번에 받는다 - 진단명과 그때 받은 처방들을 함께 저장한다."""

    visited_on: Annotated[date, Field(description="진료받은 날짜")]
    hospital_name: Annotated[str, Field(description="병원 이름", min_length=1, max_length=60)]
    diagnosis_name: Annotated[str, Field(description="의료진이 알려준 진단명", min_length=1, max_length=60)]
    prescriptions: Annotated[
        list[PrescriptionCreateRequest], Field(default_factory=list, description="처방 목록 (없으면 빈 배열)")
    ]


class PrescriptionResponse(BaseModel):
    id: int
    diagnosis_id: int
    medication_name: str
    form: str
    duration_days: int
    note: str | None
    next_visit_date: date | None
    reminder_cycle_days: int
    reminder_on: bool

    @classmethod
    def from_model(cls, prescription: Prescription) -> "PrescriptionResponse":
        return cls(
            id=prescription.id,
            diagnosis_id=prescription.diagnosis_id,
            medication_name=prescription.medication_name,
            form=prescription.form,
            duration_days=prescription.duration_days,
            note=prescription.note,
            next_visit_date=prescription.next_visit_date,
            reminder_cycle_days=prescription.reminder_cycle_days,
            reminder_on=prescription.reminder_on,
        )


class DiagnosisResponse(BaseModel):
    id: int
    case_id: int
    visited_on: date
    hospital_name: str
    diagnosis_name: str
    prescriptions: list[PrescriptionResponse]

    @classmethod
    def from_model(cls, diagnosis: Diagnosis, prescriptions: list[Prescription]) -> "DiagnosisResponse":
        return cls(
            id=diagnosis.id,
            case_id=diagnosis.case_id,
            visited_on=diagnosis.visited_on,
            hospital_name=diagnosis.hospital_name,
            diagnosis_name=diagnosis.diagnosis_name,
            prescriptions=[PrescriptionResponse.from_model(p) for p in prescriptions],
        )
