"""리포트에 담을 자료를 모아 ReportBuilder에 넘기는 층."""

from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import config
from app.repositories.case_repository import CaseRepository
from app.repositories.child_profile_repository import ChildProfileRepository
from app.repositories.record_repository import PhotoRecordRepository
from app.services.case import CaseService
from app.services.medical import MedicalService
from app.services.report import ALL_SECTIONS, ReportBuilder


class ReportService:
    def __init__(self):
        self.case_service = CaseService()
        self.medical_service = MedicalService()
        self.case_repo = CaseRepository()
        self.child_repo = ChildProfileRepository()
        self.photo_repo = PhotoRecordRepository()

    async def build_pdf(
        self, session: AsyncSession, user_id: int, case_id: int, sections: set[str]
    ) -> tuple[bytes, str]:
        case = await self.case_repo.get_owned(session, user_id, case_id)
        if case is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="사례를 찾을 수 없습니다.")

        child = await self.child_repo.get_owned(session, user_id, case.child_id)
        detail = await self.case_service.get_case_detail(session, user_id, case_id)
        diagnoses = await self.medical_service.list_diagnoses(session, user_id, case_id)

        # 사진 파일 경로는 응답 DTO에 없으므로 모델에서 따로 모아 넘긴다.
        photos = await self.photo_repo.list_by_case(session, case_id)
        image_paths = {p.id: p.image_path for p in photos if p.image_path}

        generated_on = datetime.now(tz=config.TIMEZONE).strftime("%Y-%m-%d")
        pdf = ReportBuilder(
            child_name=child.name if child else "아이",
            detail=detail,
            diagnoses=diagnoses,
            generated_on=generated_on,
            image_paths=image_paths,
        ).build(sections or set(ALL_SECTIONS))

        safe_name = "".join(ch for ch in (child.name if child else "child") if ch.isalnum() or ch in "-_")
        filename = f"kidsderm-report-{safe_name or 'child'}-{generated_on}.pdf"
        return pdf, filename
