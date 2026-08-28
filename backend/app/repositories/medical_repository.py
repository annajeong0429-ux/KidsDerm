from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.cases import Case
from app.models.child_profiles import ChildProfile
from app.models.medical import Diagnosis, Prescription


class DiagnosisRepository:
    async def list_by_case(self, session: AsyncSession, case_id: int) -> list[Diagnosis]:
        result = await session.execute(
            select(Diagnosis).where(Diagnosis.case_id == case_id).order_by(Diagnosis.visited_on)
        )
        return list(result.scalars().all())

    async def get_owned(self, session: AsyncSession, user_id: int, diagnosis_id: int) -> Diagnosis | None:
        """진단 -> 사례 -> 아이 -> 보호자까지 따라가서 내 것이 맞는지 확인한다."""
        result = await session.execute(
            select(Diagnosis)
            .join(Case, Diagnosis.case_id == Case.id)
            .join(ChildProfile, Case.child_id == ChildProfile.id)
            .where(Diagnosis.id == diagnosis_id, ChildProfile.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        session: AsyncSession,
        case_id: int,
        *,
        visited_on: date,
        hospital_name: str,
        diagnosis_name: str,
    ) -> Diagnosis:
        diagnosis = Diagnosis(
            case_id=case_id,
            visited_on=visited_on,
            hospital_name=hospital_name,
            diagnosis_name=diagnosis_name,
        )
        session.add(diagnosis)
        await session.flush()
        return diagnosis


class PrescriptionRepository:
    async def list_by_diagnosis_ids(self, session: AsyncSession, diagnosis_ids: list[int]) -> list[Prescription]:
        if not diagnosis_ids:
            return []
        result = await session.execute(
            select(Prescription).where(Prescription.diagnosis_id.in_(diagnosis_ids)).order_by(Prescription.created_at)
        )
        return list(result.scalars().all())

    async def create(
        self,
        session: AsyncSession,
        diagnosis_id: int,
        *,
        medication_name: str,
        form: str,
        duration_days: int,
        note: str | None,
        next_visit_date: date | None,
        reminder_cycle_days: int,
        reminder_on: bool,
    ) -> Prescription:
        prescription = Prescription(
            diagnosis_id=diagnosis_id,
            medication_name=medication_name,
            form=form,
            duration_days=duration_days,
            note=note,
            next_visit_date=next_visit_date,
            reminder_cycle_days=reminder_cycle_days,
            reminder_on=reminder_on,
        )
        session.add(prescription)
        await session.flush()
        return prescription
