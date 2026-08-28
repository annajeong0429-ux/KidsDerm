"""촬영 사진 업로드·조회. 실제 파일 다루기는 core/photo_storage.py가 맡고,
여기서는 "누구 사진인지"와 "올려도 되는 파일인지"를 판단한다."""

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import photo_storage
from app.core.config import config
from app.models.records import PhotoRecord
from app.repositories.record_repository import PhotoRecordRepository


class PhotoService:
    def __init__(self):
        self.photo_repo = PhotoRecordRepository()

    async def _get_owned_or_404(self, session: AsyncSession, user_id: int, photo_id: int) -> PhotoRecord:
        photo = await self.photo_repo.get_owned(session, user_id, photo_id)
        if photo is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="사진 기록을 찾을 수 없습니다.")
        return photo

    async def upload(self, session: AsyncSession, user_id: int, photo_id: int, data: bytes) -> PhotoRecord:
        photo = await self._get_owned_or_404(session, user_id, photo_id)

        if not data:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="빈 파일입니다.")
        if len(data) > config.PHOTO_MAX_BYTES:
            limit_mb = config.PHOTO_MAX_BYTES // (1024 * 1024)
            raise HTTPException(
                status_code=status.HTTP_413_CONTENT_TOO_LARGE,
                detail=f"사진은 {limit_mb}MB까지 올릴 수 있습니다.",
            )

        # 브라우저가 알려준 Content-Type은 얼마든지 바꿔 보낼 수 있으므로 믿지 않는다.
        # 파일 앞부분의 실제 바이트로 형식을 확인하고, 이미지가 아니면 거절한다.
        mime = photo_storage.detect_mime(data)
        if mime is None or mime not in photo_storage.ALLOWED_MIME:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail="JPG, PNG, WEBP 형식의 이미지만 올릴 수 있습니다.",
            )

        # 같은 기록에 사진을 다시 올리면 이전 파일은 필요 없어지므로 지운다.
        previous = photo.image_path

        try:
            path = photo_storage.save(data, case_id=photo.case_id)
        except photo_storage.PhotoStorageError as exc:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc

        await self.photo_repo.attach_image(session, photo, path=path, mime=mime, size=len(data))
        await session.commit()

        if previous:
            photo_storage.delete(previous)
        return photo

    async def download(self, session: AsyncSession, user_id: int, photo_id: int) -> tuple[bytes, str]:
        photo = await self._get_owned_or_404(session, user_id, photo_id)
        if not photo.image_path:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="아직 사진이 등록되지 않았습니다.")
        try:
            return photo_storage.load(photo.image_path), photo.image_mime or "application/octet-stream"
        except photo_storage.PhotoStorageError as exc:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc
