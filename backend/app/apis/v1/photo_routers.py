from typing import Annotated

from fastapi import APIRouter, Depends, File, Response, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import config
from app.core.db.database import get_db
from app.dependencies.security import get_request_user
from app.models.users import User
from app.services.photo import PhotoService

photo_router = APIRouter(prefix="/photos", tags=["photos"])

NOT_FOUND = {status.HTTP_404_NOT_FOUND: {"description": "내 사진 기록 중에 그런 id가 없음"}}


@photo_router.post(
    "/{photo_id}/image",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="촬영 사진 업로드",
    description=(
        "촬영 기록에 실제 사진 파일을 붙인다. 파일은 암호화해서 저장되며, "
        "이미 사진이 있으면 새 사진으로 교체되고 이전 파일은 삭제된다."
    ),
    responses={
        **NOT_FOUND,
        status.HTTP_413_CONTENT_TOO_LARGE: {"description": "허용 용량 초과"},
        status.HTTP_415_UNSUPPORTED_MEDIA_TYPE: {"description": "이미지 파일이 아님"},
    },
)
async def upload_photo_image(
    photo_id: int,
    user: Annotated[User, Depends(get_request_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
    service: Annotated[PhotoService, Depends(PhotoService)],
    image: Annotated[UploadFile, File(description="JPG / PNG / WEBP")],
) -> None:
    # 상한보다 1바이트만 더 읽어본다 - 여기서 크기를 비교해야 거대한 파일을
    # 통째로 메모리에 올리는 일을 피할 수 있다.
    data = await image.read(config.PHOTO_MAX_BYTES + 1)
    await service.upload(session, user.id, photo_id, data)


@photo_router.get(
    "/{photo_id}/image",
    summary="촬영 사진 내려받기",
    description="본인이 등록한 사진만 볼 수 있다. 서버가 복호화해서 이미지로 돌려준다.",
    responses={**NOT_FOUND, 200: {"content": {"image/jpeg": {}}, "description": "이미지 파일"}},
    response_class=Response,
)
async def download_photo_image(
    photo_id: int,
    user: Annotated[User, Depends(get_request_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
    service: Annotated[PhotoService, Depends(PhotoService)],
) -> Response:
    data, mime = await service.download(session, user.id, photo_id)
    return Response(
        content=data,
        media_type=mime,
        # 아동의 피부 사진이므로 중간 서버나 브라우저 공용 캐시에 남지 않게 한다.
        headers={"Cache-Control": "private, no-store"},
    )
