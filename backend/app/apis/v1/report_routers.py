from typing import Annotated
from urllib.parse import quote

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db.database import get_db
from app.dependencies.security import get_request_user
from app.models.users import User
from app.services.report import ALL_SECTIONS
from app.services.report_service import ReportService

report_router = APIRouter(prefix="/cases/{case_id}/report", tags=["report"])


@report_router.get(
    ".pdf",
    summary="진료용 리포트 PDF",
    description=(
        "경과 자료를 A4 한 장으로 정리한 PDF를 내려준다. "
        "sections로 담을 항목을 고를 수 있다 (photos, graph, symptoms, prescription). "
        "지정하지 않으면 전부 포함한다."
    ),
    responses={
        status.HTTP_200_OK: {"content": {"application/pdf": {}}, "description": "PDF 파일"},
        status.HTTP_404_NOT_FOUND: {"description": "내 사례 중에 그런 id가 없음"},
    },
    response_class=Response,
)
async def download_report(
    case_id: int,
    user: Annotated[User, Depends(get_request_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
    service: Annotated[ReportService, Depends(ReportService)],
    sections: Annotated[
        list[str] | None,
        Query(description=f"담을 항목. 가능한 값: {', '.join(ALL_SECTIONS)}"),
    ] = None,
) -> Response:
    chosen = {s for s in (sections or ALL_SECTIONS) if s in ALL_SECTIONS}
    pdf, filename = await service.build_pdf(session, user.id, case_id, chosen)
    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={
            # 파일명에 한글이 들어갈 수 있어 RFC 5987 방식으로 함께 적어준다.
            "Content-Disposition": f"attachment; filename*=UTF-8''{quote(filename)}",
            # 아이의 병변 사진이 들어 있는 문서라 공용 캐시에 남지 않게 한다.
            "Cache-Control": "private, no-store",
        },
    )
