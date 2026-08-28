from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db.database import get_db
from app.dependencies.security import get_request_user
from app.dtos.medical import DiagnosisCreateRequest, DiagnosisResponse
from app.models.users import User
from app.services.medical import MedicalService

# 진단은 항상 어떤 사례에 대한 것이므로 사례 밑에 둔다.
diagnosis_router = APIRouter(prefix="/cases/{case_id}/diagnoses", tags=["medical"])
# 삭제만은 진단 id 하나로 지목하는 게 자연스러워서 경로를 따로 뒀다.
diagnosis_item_router = APIRouter(prefix="/diagnoses", tags=["medical"])

CASE_NOT_FOUND = {status.HTTP_404_NOT_FOUND: {"description": "내 사례 중에 그런 id가 없음"}}


@diagnosis_router.get(
    "",
    response_model=list[DiagnosisResponse],
    summary="사례의 진단·처방 목록",
    description="진료받은 날짜 순으로 돌려준다. 각 진단에 그때 받은 처방이 함께 담겨 있다.",
    responses=CASE_NOT_FOUND,
)
async def list_diagnoses(
    case_id: int,
    user: Annotated[User, Depends(get_request_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
    service: Annotated[MedicalService, Depends(MedicalService)],
) -> list[DiagnosisResponse]:
    return await service.list_diagnoses(session, user.id, case_id)


@diagnosis_router.post(
    "",
    response_model=DiagnosisResponse,
    status_code=status.HTTP_201_CREATED,
    summary="진단·처방 입력",
    description="병원에 다녀와서 받은 진단명과 처방을 한 번에 저장한다.",
    responses=CASE_NOT_FOUND,
)
async def create_diagnosis(
    case_id: int,
    body: DiagnosisCreateRequest,
    user: Annotated[User, Depends(get_request_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
    service: Annotated[MedicalService, Depends(MedicalService)],
) -> DiagnosisResponse:
    return await service.create_diagnosis(session, user.id, case_id, body)


@diagnosis_item_router.delete(
    "/{diagnosis_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="진단 기록 삭제",
    description="딸린 처방도 함께 삭제된다.",
    responses={status.HTTP_404_NOT_FOUND: {"description": "내 진단 기록 중에 그런 id가 없음"}},
)
async def delete_diagnosis(
    diagnosis_id: int,
    user: Annotated[User, Depends(get_request_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
    service: Annotated[MedicalService, Depends(MedicalService)],
) -> None:
    await service.delete_diagnosis(session, user.id, diagnosis_id)
