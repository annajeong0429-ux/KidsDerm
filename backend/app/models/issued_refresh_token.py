from datetime import datetime

from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class IssuedRefreshToken(Base):
    """발급된 Refresh Token의 jti(고유ID)를 추적한다 - 토큰 로테이션 + 재사용 탐지용.

    로그인/토큰갱신할 때마다 새 Refresh Token을 발급하고 예전 것은 is_revoked=True로
    무효화한다. 만약 이미 무효화된 토큰이 다시 사용되면, 그건 토큰이 탈취되어 공격자와
    정상 사용자가 각자 따로 쓰고 있다는 신호이므로 그 계정의 모든 세션을 강제 로그아웃시킨다.
    """

    __tablename__ = "issued_refresh_tokens"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    jti: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    is_revoked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
