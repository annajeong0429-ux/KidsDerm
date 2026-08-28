from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.cases import Case
from app.models.child_profiles import ChildProfile


class CaseRepository:
    """[보안 원칙] 사례는 아이에 속하고, 아이는 보호자에 속한다. 그래서 "내 사례가 맞는지"는
    cases -> child_profiles를 join해서 user_id까지 따라가야 확인할 수 있다.
    case_id만으로 조회하는 함수는 만들지 않는다 - 남의 사례가 새어나가는 통로가 되기 때문이다.
    """

    def _owned_query(self, user_id: int):
        return select(Case).join(ChildProfile, Case.child_id == ChildProfile.id).where(ChildProfile.user_id == user_id)

    async def list_by_user(self, session: AsyncSession, user_id: int) -> list[Case]:
        result = await session.execute(self._owned_query(user_id).order_by(Case.created_at.desc()))
        return list(result.scalars().all())

    async def list_by_child(self, session: AsyncSession, user_id: int, child_id: int) -> list[Case]:
        result = await session.execute(
            self._owned_query(user_id).where(Case.child_id == child_id).order_by(Case.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_owned(self, session: AsyncSession, user_id: int, case_id: int) -> Case | None:
        result = await session.execute(self._owned_query(user_id).where(Case.id == case_id))
        return result.scalar_one_or_none()

    async def create(
        self,
        session: AsyncSession,
        child_id: int,
        *,
        body_part: str,
        body_part_detail: str | None,
    ) -> Case:
        case = Case(child_id=child_id, body_part=body_part, body_part_detail=body_part_detail)
        session.add(case)
        await session.flush()
        return case

    async def delete(self, session: AsyncSession, case: Case) -> None:
        await session.delete(case)
