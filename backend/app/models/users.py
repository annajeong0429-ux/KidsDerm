from datetime import datetime

from sqlalchemy import BigInteger, Boolean, DateTime, Integer, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class User(Base):
    """계정/인증 전용 테이블. kidsderm-ai의 "아이 프로필"은 이것과 별개의 개념이며,
    로그인한 보호자(User) 한 명이 아이 프로필을 여러 개 가질 수 있다 (추후 연동)."""

    __tablename__ = "users"
    __table_args__ = (UniqueConstraint("sns_provider", "sns_id", name="uq_users_sns_provider_sns_id"),)

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(40), unique=True, nullable=False)
    # 소셜 로그인 계정은 비밀번호가 없다(본인이 정한 적 없음) - 이메일 가입자만 값이 있다.
    hashed_password: Mapped[str | None] = mapped_column(String(128), nullable=True)
    # 이메일 가입자는 둘 다 None. 소셜 가입자는 "google"/"kakao"/"naver" + 그 서비스의 사용자 고유 ID.
    sns_provider: Mapped[str | None] = mapped_column(String(20), nullable=True)
    sns_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    # [로그인 시도 제한] 브루트포스 방어 - 연속 실패 시 일정 시간 잠근다 (app/services/auth.py 참고).
    failed_login_attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    locked_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_login: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    # [개인정보보호법 제23조 - 민감정보 동의] 필수 동의 2종은 언제 동의했는지 서버에 증거로
    # 남긴다. null이면 미동의 - 회원가입 자체가 이 두 값을 채우지 않고는 성공하지 않는다
    # (services/auth.py의 signup 참고). 클라이언트가 보낸 시각이 아니라 서버가 요청을 받은
    # 시각을 저장한다 - 클라이언트 시계는 조작/오차가 있을 수 있어 신뢰하지 않는다.
    terms_of_service_consented_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    health_info_consented_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    # 마케팅 동의는 선택 항목이라, 나중에 껐다 켰다 할 수 있게 "철회 시각"도 따로 둔다.
    # 동의 중인지 여부는 "marketing_consented_at이 있고 marketing_consent_revoked_at이 없음"으로 판단한다.
    marketing_consented_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    marketing_consent_revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
