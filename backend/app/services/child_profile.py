from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dtos.children import ChildProfileCreateRequest, ChildProfileUpdateRequest
from app.models.child_profiles import ChildProfile
from app.core import photo_storage
from app.repositories.child_profile_repository import ChildProfileRepository
from app.repositories.record_repository import PhotoRecordRepository

# 한 보호자가 등록할 수 있는 아이 수 상한. 실수나 장난으로 무한정 만들어지는 걸 막는 안전장치다.
MAX_CHILDREN_PER_USER = 10


class ChildProfileService:
    def __init__(self):
        self.child_repo = ChildProfileRepository()
        self.photo_repo = PhotoRecordRepository()

    async def list_children(self, session: AsyncSession, user_id: int) -> list[ChildProfile]:
        return await self.child_repo.list_by_user(session, user_id)

    async def get_owned_or_404(self, session: AsyncSession, user_id: int, child_id: int) -> ChildProfile:
        """[보안] 남의 아이를 조회하려 해도 403이 아니라 404를 준다.
        403은 "그 id는 존재하지만 네 것이 아니다"라는 정보를 알려주는 셈이라,
        존재 여부 자체를 숨기려면 404가 맞다."""
        child = await self.child_repo.get_owned(session, user_id, child_id)
        if child is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="아이 프로필을 찾을 수 없습니다.")
        return child

    async def create_child(
        self, session: AsyncSession, user_id: int, data: ChildProfileCreateRequest
    ) -> ChildProfile:
        existing = await self.child_repo.list_by_user(session, user_id)
        if len(existing) >= MAX_CHILDREN_PER_USER:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"아이는 최대 {MAX_CHILDREN_PER_USER}명까지 등록할 수 있습니다.",
            )

        child = await self.child_repo.create(
            session,
            user_id,
            name=data.name,
            birth_date=data.birth_date,
            gender=data.gender,
            region_province=data.region.province,
            region_district=data.region.district,
            avatar_color=data.avatar_color,
        )
        await session.commit()
        return child

    async def update_child(
        self, session: AsyncSession, user_id: int, child_id: int, data: ChildProfileUpdateRequest
    ) -> ChildProfile:
        child = await self.get_owned_or_404(session, user_id, child_id)
        child.name = data.name
        child.birth_date = data.birth_date
        child.gender = data.gender
        child.region_province = data.region.province
        child.region_district = data.region.district
        child.avatar_color = data.avatar_color
        await session.commit()
        return child

    async def delete_child(self, session: AsyncSession, user_id: int, child_id: int) -> None:
        """아이를 지우면 그 아이의 사례·사진·증상 기록도 DB가 함께 지운다(CASCADE).
        디스크의 사진 파일은 DB가 안 지우므로 경로를 먼저 챙겨뒀다가 따로 지운다."""
        child = await self.get_owned_or_404(session, user_id, child_id)
        image_paths = await self.photo_repo.image_paths_for_child(session, child.id)
        await self.child_repo.delete(session, child)
        await session.commit()
        photo_storage.delete_many(image_paths)
