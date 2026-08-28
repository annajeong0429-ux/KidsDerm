from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dtos.medical import DiagnosisCreateRequest, DiagnosisResponse
from app.models.medical import Prescription
from app.repositories.case_repository import CaseRepository
from app.repositories.medical_repository import DiagnosisRepository, PrescriptionRepository


class MedicalService:
    def __init__(self):
        self.case_repo = CaseRepository()
        self.diagnosis_repo = DiagnosisRepository()
        self.prescription_repo = PrescriptionRepository()

    async def _ensure_case_owned(self, session: AsyncSession, user_id: int, case_id: int) -> None:
        if await self.case_repo.get_owned(session, user_id, case_id) is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="사례를 찾을 수 없습니다.")

    async def list_diagnoses(self, session: AsyncSession, user_id: int, case_id: int) -> list[DiagnosisResponse]:
        await self._ensure_case_owned(session, user_id, case_id)
        diagnoses = await self.diagnosis_repo.list_by_case(session, case_id)
        prescriptions = await self.prescription_repo.list_by_diagnosis_ids(session, [d.id for d in diagnoses])

        by_diagnosis: dict[int, list[Prescription]] = {d.id: [] for d in diagnoses}
        for prescription in prescriptions:
            by_diagnosis[prescription.diagnosis_id].append(prescription)

        return [DiagnosisResponse.from_model(d, by_diagnosis[d.id]) for d in diagnoses]

    async def create_diagnosis(
        self, session: AsyncSession, user_id: int, case_id: int, data: DiagnosisCreateRequest
    ) -> DiagnosisResponse:
        await self._ensure_case_owned(session, user_id, case_id)

        diagnosis = await self.diagnosis_repo.create(
            session,
            case_id,
            visited_on=data.visited_on,
            hospital_name=data.hospital_name,
            diagnosis_name=data.diagnosis_name,
        )
        created: list[Prescription] = []
        for item in data.prescriptions:
            created.append(
                await self.prescription_repo.create(
                    session,
                    diagnosis.id,
                    medication_name=item.medication_name,
                    form=item.form,
                    duration_days=item.duration_days,
                    note=item.note,
                    next_visit_date=item.next_visit_date,
                    reminder_cycle_days=item.reminder_cycle_days,
                    reminder_on=item.reminder_on,
                )
            )
        # 진단과 처방은 한 번의 진료 결과라 반드시 함께 저장되거나 함께 실패해야 한다.
        # 마지막에 한 번만 commit하므로, 중간에 오류가 나면 진단만 남는 일이 없다.
        await session.commit()

        return DiagnosisResponse.from_model(diagnosis, created)

    async def delete_diagnosis(self, session: AsyncSession, user_id: int, diagnosis_id: int) -> None:
        diagnosis = await self.diagnosis_repo.get_owned(session, user_id, diagnosis_id)
        if diagnosis is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="진단 기록을 찾을 수 없습니다.")
        await session.delete(diagnosis)
        await session.commit()
