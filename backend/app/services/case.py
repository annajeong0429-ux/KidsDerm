from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import photo_storage
from app.core.config import config
from app.dtos.cases import (
    CaseDetailResponse,
    CaseResponse,
    PhotoRecordResponse,
    RecordCreateRequest,
    RecordCreateResponse,
    TrendStatus,
)
from app.models.cases import Case
from app.models.records import PhotoRecord, SymptomRecord
from app.repositories.case_repository import CaseRepository
from app.repositories.record_repository import PhotoRecordRepository, SymptomRecordRepository
from app.services.child_profile import ChildProfileService

# 면적 비율이 처음보다 20% 이상 줄면 호전, 20% 이상 늘면 확대 추세, 그 사이는 유지로 본다.
# (의학적 기준이 아니라 화면에 추세를 표시하기 위한 표시용 임계값이다.)
IMPROVE_RATIO = 0.8
WORSEN_RATIO = 1.2


def to_naive_kst(value: datetime) -> datetime:
    """시간대 정보가 붙은 시각과 안 붙은 시각을 섞으면 뺄셈에서 에러가 난다.
    MySQL은 시간대를 저장하지 않아 DB에서 읽어온 값은 항상 시간대가 없으므로,
    저장 전에 한국 시각 기준의 "시간대 없는 값"으로 통일해둔다."""
    if value.tzinfo is None:
        return value
    return value.astimezone(config.TIMEZONE).replace(tzinfo=None)


class CaseService:
    def __init__(self):
        self.case_repo = CaseRepository()
        self.photo_repo = PhotoRecordRepository()
        self.symptom_repo = SymptomRecordRepository()
        self.child_service = ChildProfileService()

    # ---------- 조회 ----------

    def _summarize(self, case: Case, photos: list[PhotoRecord]) -> CaseResponse:
        """사진 기록으로부터 사례 요약값을 계산한다. 저장된 값이 아니라 매번 계산하기 때문에
        사진을 추가/삭제해도 요약이 실제 기록과 어긋날 일이 없다."""
        if not photos:
            return CaseResponse(
                id=case.id,
                child_id=case.child_id,
                body_part=case.body_part,
                body_part_detail=case.body_part_detail,
                created_at=case.created_at,
                active=case.active,
                status="유지",
                baseline_area_ratio=0.0,
                latest_area_ratio=0.0,
                days_observed=0,
                photo_count=0,
            )

        baseline = photos[0].area_ratio
        latest = photos[-1].area_ratio
        days_observed = (photos[-1].taken_at - photos[0].taken_at).days

        trend: TrendStatus
        if baseline <= 0:
            # 처음부터 병변 면적이 0이면 비율로 비교할 수 없다(0으로 나누는 셈).
            trend = "확대 추세" if latest > 0 else "유지"
        elif latest <= baseline * IMPROVE_RATIO:
            trend = "호전"
        elif latest >= baseline * WORSEN_RATIO:
            trend = "확대 추세"
        else:
            trend = "유지"

        return CaseResponse(
            id=case.id,
            child_id=case.child_id,
            body_part=case.body_part,
            body_part_detail=case.body_part_detail,
            created_at=case.created_at,
            active=case.active,
            status=trend,
            baseline_area_ratio=baseline,
            latest_area_ratio=latest,
            days_observed=days_observed,
            photo_count=len(photos),
        )

    async def list_cases(
        self, session: AsyncSession, user_id: int, child_id: int | None = None
    ) -> list[CaseResponse]:
        if child_id is not None:
            # 내 아이가 맞는지 먼저 확인한다(아니면 404).
            await self.child_service.get_owned_or_404(session, user_id, child_id)
            cases = await self.case_repo.list_by_child(session, user_id, child_id)
        else:
            cases = await self.case_repo.list_by_user(session, user_id)

        # 사례마다 사진을 따로 조회하면 쿼리가 사례 수만큼 나가므로, 한 번에 가져와 나눠 담는다.
        photos = await self.photo_repo.list_by_case_ids(session, [c.id for c in cases])
        by_case: dict[int, list[PhotoRecord]] = {c.id: [] for c in cases}
        for photo in photos:
            by_case[photo.case_id].append(photo)

        return [self._summarize(case, by_case[case.id]) for case in cases]

    async def get_case_detail(self, session: AsyncSession, user_id: int, case_id: int) -> CaseDetailResponse:
        case = await self._get_owned_or_404(session, user_id, case_id)
        photos = await self.photo_repo.list_by_case(session, case.id)
        symptoms = await self.symptom_repo.list_by_photo_ids(session, [p.id for p in photos])
        symptom_by_photo: dict[int, SymptomRecord] = {s.photo_record_id: s for s in symptoms}

        summary = self._summarize(case, photos)
        return CaseDetailResponse(
            **summary.model_dump(),
            photos=[PhotoRecordResponse.from_model(p, symptom_by_photo.get(p.id)) for p in photos],
        )

    async def _get_owned_or_404(self, session: AsyncSession, user_id: int, case_id: int) -> Case:
        case = await self.case_repo.get_owned(session, user_id, case_id)
        if case is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="사례를 찾을 수 없습니다.")
        return case

    # ---------- 기록 저장 ----------

    async def create_record(
        self, session: AsyncSession, user_id: int, child_id: int, data: RecordCreateRequest
    ) -> RecordCreateResponse:
        """촬영 기록 하나를 저장한다. 같은 부위를 관찰 중인 사례가 이미 있으면 거기에 이어 붙이고,
        없으면 사례를 새로 만든다 - 사용자는 "어느 사례에 넣을지" 고를 필요가 없다."""
        await self.child_service.get_owned_or_404(session, user_id, child_id)

        existing = await self.case_repo.list_by_child(session, user_id, child_id)
        case = next((c for c in existing if c.active and c.body_part == data.body_part), None)
        case_created = case is None
        if case is None:
            case = await self.case_repo.create(
                session,
                child_id,
                body_part=data.body_part,
                body_part_detail=data.body_part_detail,
            )
            # created_at은 DB가 채우는 값이라, 방금 만든 객체에는 아직 값이 없다.
            # 비동기 환경에서는 값이 빈 속성을 그냥 읽으면 오류가 나므로 명시적으로 다시 읽어온다.
            await session.refresh(case)

        taken_at = to_naive_kst(data.taken_at or datetime.now(tz=config.TIMEZONE))
        photo = await self.photo_repo.create(
            session,
            case.id,
            taken_at=taken_at,
            image_color=data.image_color,
            area_ratio=data.area_ratio,
            erythema=data.signs.erythema,
            papulation=data.signs.papulation,
            excoriation=data.signs.excoriation,
            lichenification=data.signs.lichenification,
        )
        symptom = await self.symptom_repo.create(
            session,
            photo.id,
            itching=data.symptoms.itching,
            oozing=data.symptoms.oozing,
            pain=data.symptoms.pain,
            fever_celsius=data.symptoms.fever_celsius,
            new_lesion=data.symptoms.new_lesion,
            memo=data.symptoms.memo,
            onset_timing=data.symptoms.onset_timing,
            onset_timing_detail=data.symptoms.onset_timing_detail,
            distribution=data.symptoms.distribution,
        )
        await session.commit()

        photos = await self.photo_repo.list_by_case(session, case.id)
        return RecordCreateResponse(
            case=self._summarize(case, photos),
            photo=PhotoRecordResponse.from_model(photo, symptom),
            case_created=case_created,
        )

    # ---------- 사례 상태 변경 ----------

    async def set_active(self, session: AsyncSession, user_id: int, case_id: int, active: bool) -> CaseResponse:
        case = await self._get_owned_or_404(session, user_id, case_id)
        case.active = active
        await session.commit()
        photos = await self.photo_repo.list_by_case(session, case.id)
        return self._summarize(case, photos)

    async def delete_case(self, session: AsyncSession, user_id: int, case_id: int) -> None:
        """사례를 지우면 그 안의 사진·증상·진단·처방 기록도 DB가 함께 지운다(CASCADE).

        다만 DB는 디스크에 있는 사진 파일까지 지워주지 않으므로, 행을 지우기 전에
        파일 경로를 먼저 모아뒀다가 커밋이 끝난 뒤에 파일을 지운다."""
        case = await self._get_owned_or_404(session, user_id, case_id)
        image_paths = await self.photo_repo.image_paths_for_case(session, case.id)
        await self.case_repo.delete(session, case)
        await session.commit()
        photo_storage.delete_many(image_paths)
