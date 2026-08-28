from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.records import PhotoRecord, SymptomRecord


class PhotoRecordRepository:
    """사례(case) 소유권은 CaseRepository에서 이미 확인한 뒤에 이 저장소를 쓴다.
    그래서 여기서는 case_id 기준으로만 조회해도 안전하다."""

    async def list_by_case(self, session: AsyncSession, case_id: int) -> list[PhotoRecord]:
        result = await session.execute(
            select(PhotoRecord).where(PhotoRecord.case_id == case_id).order_by(PhotoRecord.taken_at)
        )
        return list(result.scalars().all())

    async def list_by_case_ids(self, session: AsyncSession, case_ids: list[int]) -> list[PhotoRecord]:
        """여러 사례의 사진을 한 번의 쿼리로 가져온다. 사례 목록 화면에서 사례마다
        따로 조회하면 사례 수만큼 쿼리가 나가는 문제(N+1)를 피하기 위한 것이다."""
        if not case_ids:
            return []
        result = await session.execute(
            select(PhotoRecord).where(PhotoRecord.case_id.in_(case_ids)).order_by(PhotoRecord.taken_at)
        )
        return list(result.scalars().all())

    async def create(
        self,
        session: AsyncSession,
        case_id: int,
        *,
        taken_at: datetime,
        image_color: str,
        area_ratio: float,
        erythema: int,
        papulation: int,
        excoriation: int,
        lichenification: int,
    ) -> PhotoRecord:
        photo = PhotoRecord(
            case_id=case_id,
            taken_at=taken_at,
            image_color=image_color,
            area_ratio=area_ratio,
            erythema=erythema,
            papulation=papulation,
            excoriation=excoriation,
            lichenification=lichenification,
        )
        session.add(photo)
        await session.flush()
        return photo


class SymptomRecordRepository:
    async def create(
        self,
        session: AsyncSession,
        photo_record_id: int,
        *,
        itching: int,
        oozing: int,
        pain: int,
        fever_celsius: float,
        new_lesion: bool,
        memo: str | None,
        onset_timing: str,
        onset_timing_detail: str | None,
        distribution: str,
    ) -> SymptomRecord:
        symptom = SymptomRecord(
            photo_record_id=photo_record_id,
            itching=itching,
            oozing=oozing,
            pain=pain,
            fever_celsius=fever_celsius,
            new_lesion=new_lesion,
            memo=memo,
            onset_timing=onset_timing,
            onset_timing_detail=onset_timing_detail,
            distribution=distribution,
        )
        session.add(symptom)
        await session.flush()
        return symptom

    async def list_by_photo_ids(self, session: AsyncSession, photo_ids: list[int]) -> list[SymptomRecord]:
        if not photo_ids:
            return []
        result = await session.execute(select(SymptomRecord).where(SymptomRecord.photo_record_id.in_(photo_ids)))
        return list(result.scalars().all())
