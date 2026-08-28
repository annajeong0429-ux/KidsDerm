from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db.database import get_db
from app.dependencies.security import get_request_user
from app.dtos.cases import (
    CaseDetailResponse,
    CaseResponse,
    CaseUpdateRequest,
    RecordCreateRequest,
    RecordCreateResponse,
)
from app.models.users import User
from app.services.case import CaseService

case_router = APIRouter(prefix="/cases", tags=["cases"])
# 기록 저장은 "어느 아이의 기록인지"가 먼저라서 아이 밑에 둔다.
record_router = APIRouter(prefix="/children/{child_id}/records", tags=["records"])

CASE_NOT_FOUND = {status.HTTP_404_NOT_FOUND: {"description": "내 사례 중에 그런 id가 없음"}}


@case_router.get(
    "",
    response_model=list[CaseResponse],
    summary="사례 목록",
    description="내 아이들의 사례를 모두 돌려준다. child_id를 주면 그 아이 것만 돌려준다.",
)
async def list_cases(
    user: Annotated[User, Depends(get_request_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
    service: Annotated[CaseService, Depends(CaseService)],
    child_id: Annotated[int | None, Query(description="특정 아이의 사례만 보고 싶을 때")] = None,
) -> list[CaseResponse]:
    return await service.list_cases(session, user.id, child_id)


@case_router.get(
    "/{case_id}",
    response_model=CaseDetailResponse,
    summary="사례 상세",
    description="사례 요약과 함께 그 사례에 쌓인 사진·증상 기록을 촬영 순서대로 돌려준다.",
    responses=CASE_NOT_FOUND,
)
async def get_case(
    case_id: int,
    user: Annotated[User, Depends(get_request_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
    service: Annotated[CaseService, Depends(CaseService)],
) -> CaseDetailResponse:
    return await service.get_case_detail(session, user.id, case_id)


@case_router.patch(
    "/{case_id}",
    response_model=CaseResponse,
    summary="관찰 종료/재개",
    responses=CASE_NOT_FOUND,
)
async def update_case(
    case_id: int,
    body: CaseUpdateRequest,
    user: Annotated[User, Depends(get_request_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
    service: Annotated[CaseService, Depends(CaseService)],
) -> CaseResponse:
    return await service.set_active(session, user.id, case_id, body.active)


@case_router.delete(
    "/{case_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="사례 삭제",
    description="사례에 딸린 사진·증상·진단·처방 기록도 함께 삭제된다.",
    responses=CASE_NOT_FOUND,
)
async def delete_case(
    case_id: int,
    user: Annotated[User, Depends(get_request_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
    service: Annotated[CaseService, Depends(CaseService)],
) -> None:
    await service.delete_case(session, user.id, case_id)


@record_router.post(
    "",
    response_model=RecordCreateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="촬영 기록 저장",
    description=(
        "촬영 흐름에서 모은 값(사진 측정값 + 자가보고 증상)을 한 번에 저장한다. "
        "같은 부위를 관찰 중인 사례가 있으면 거기에 이어 붙고, 없으면 사례가 새로 만들어진다."
    ),
    responses={status.HTTP_404_NOT_FOUND: {"description": "내 아이 중에 그런 id가 없음"}},
)
async def create_record(
    child_id: int,
    body: RecordCreateRequest,
    user: Annotated[User, Depends(get_request_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
    service: Annotated[CaseService, Depends(CaseService)],
) -> RecordCreateResponse:
    return await service.create_record(session, user.id, child_id, body)
