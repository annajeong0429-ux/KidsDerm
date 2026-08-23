from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.dependencies.security import get_request_user
from app.models.users import User

user_router = APIRouter(prefix="/users", tags=["users"])


class MeResponse(BaseModel):
    id: int
    email: str


@user_router.get(
    "/me",
    response_model=MeResponse,
    summary="내 계정 정보",
    description="Authorization: Bearer <access_token> 헤더가 유효한지 확인하고, 로그인한 계정 정보를 돌려준다.",
)
async def get_me(user: Annotated[User, Depends(get_request_user)]) -> MeResponse:
    return MeResponse(id=user.id, email=user.email)
