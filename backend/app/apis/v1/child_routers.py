from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db.database import get_db
from app.dependencies.security import get_request_user
from app.dtos.children import ChildProfileCreateRequest, ChildProfileResponse, ChildProfileUpdateRequest
from app.models.users import User
from app.services.child_profile import ChildProfileService

# 이 라우터의 모든 API는 get_request_user 의존성 때문에 로그인 없이는 호출 자체가 안 된다(401).
child_router = APIRouter(prefix="/children", tags=["children"])

NOT_FOUND = {status.HTTP_404_NOT_FOUND: {"description": "내 아이 중에 그런 id가 없음"}}


@child_router.get(
    "",
    response_model=list[ChildProfileResponse],
    summary="내 아이 목록",
    description="로그인한 보호자 본인이 등록한 아이만 돌려준다.",
)
async def list_children(
    user: Annotated[User, Depends(get_request_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
    service: Annotated[ChildProfileService, Depends(ChildProfileService)],
) -> list[ChildProfileResponse]:
    children = await service.list_children(session, user.id)
    return [ChildProfileResponse.from_model(c) for c in children]


@child_router.post(
    "",
    response_model=ChildProfileResponse,
    status_code=status.HTTP_201_CREATED,
    summary="아이 등록",
    responses={status.HTTP_400_BAD_REQUEST: {"description": "등록 가능한 아이 수를 초과"}},
)
async def create_child(
    body: ChildProfileCreateRequest,
    user: Annotated[User, Depends(get_request_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
    service: Annotated[ChildProfileService, Depends(ChildProfileService)],
) -> ChildProfileResponse:
    child = await service.create_child(session, user.id, body)
    return ChildProfileResponse.from_model(child)


@child_router.get("/{child_id}", response_model=ChildProfileResponse, summary="아이 상세", responses=NOT_FOUND)
async def get_child(
    child_id: int,
    user: Annotated[User, Depends(get_request_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
    service: Annotated[ChildProfileService, Depends(ChildProfileService)],
) -> ChildProfileResponse:
    child = await service.get_owned_or_404(session, user.id, child_id)
    return ChildProfileResponse.from_model(child)


@child_router.put("/{child_id}", response_model=ChildProfileResponse, summary="아이 정보 수정", responses=NOT_FOUND)
async def update_child(
    child_id: int,
    body: ChildProfileUpdateRequest,
    user: Annotated[User, Depends(get_request_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
    service: Annotated[ChildProfileService, Depends(ChildProfileService)],
) -> ChildProfileResponse:
    child = await service.update_child(session, user.id, child_id, body)
    return ChildProfileResponse.from_model(child)


@child_router.delete(
    "/{child_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="아이 삭제",
    description="해당 아이의 사례·사진·증상 기록도 함께 삭제된다.",
    responses=NOT_FOUND,
)
async def delete_child(
    child_id: int,
    user: Annotated[User, Depends(get_request_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
    service: Annotated[ChildProfileService, Depends(ChildProfileService)],
) -> None:
    await service.delete_child(session, user.id, child_id)
