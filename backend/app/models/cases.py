from datetime import datetime

from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Case(Base):
    """관찰 사례. "왼쪽 팔오금에 생긴 병변을 몇 주간 지켜보는 것" 하나가 사례 하나다.
    같은 아이라도 부위가 다르면 사례를 따로 만든다(부위별로 경과가 다르기 때문).

    [주의] 중증도/면적 추세(호전·유지·확대) 같은 값은 이 테이블에 저장하지 않는다.
    사진이 하나 추가될 때마다 달라지는 값이라, 저장해두면 실제 사진 기록과 어긋날 수 있다.
    대신 조회할 때 사진 기록으로부터 매번 계산한다 (services/case.py 참고).
    """

    __tablename__ = "cases"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    child_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("child_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    body_part: Mapped[str] = mapped_column(String(40), nullable=False)
    # 부위를 "기타"로 고른 경우 보호자가 직접 적은 설명이 들어간다.
    body_part_detail: Mapped[str | None] = mapped_column(String(100), nullable=True)
    # 관찰을 끝낸 사례는 active=False가 되어 "지난 사례"로 넘어간다(기록 자체는 남는다).
    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
