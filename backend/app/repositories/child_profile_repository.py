from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.child_profiles import ChildProfile


class ChildProfileRepository:
    """[보안 원칙] 이 저장소의 모든 조회 함수는 반드시 user_id를 함께 받아서 조건에 넣는다.
    아이 id만으로 조회하는 함수를 만들면, 남의 아이 정보를 id 추측만으로 볼 수 있게 된다."""

    async def list_by_user(self, session: AsyncSession, user_id: int) -> list[ChildProfile]:
        result = await session.execute(
            select(ChildProfile).where(ChildProfile.user_id == user_id).order_by(ChildProfile.created_at)
        )
        return list(result.scalars().all())

    async def get_owned(self, session: AsyncSession, user_id: int, child_id: int) -> ChildProfile | None:
        """내 아이가 맞을 때만 돌려준다. 남의 아이 id를 넣으면 None이 나온다."""
        result = await session.execute(
            select(ChildProfile).where(ChildProfile.id == child_id, ChildProfile.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        session: AsyncSession,
        user_id: int,
        *,
        name: str,
        birth_date: date,
        gender: str,
        region_province: str,
        region_district: str,
        avatar_color: str,
    ) -> ChildProfile:
        child = ChildProfile(
            user_id=user_id,
            name=name,
            birth_date=birth_date,
            gender=gender,
            region_province=region_province,
            region_district=region_district,
            avatar_color=avatar_color,
        )
        session.add(child)
        await session.flush()
        return child

    async def delete(self, session: AsyncSession, child: ChildProfile) -> None:
        await session.delete(child)
