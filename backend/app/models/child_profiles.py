from datetime import date, datetime

from sqlalchemy import BigInteger, Date, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class ChildProfile(Base):
    """아이 프로필. 로그인한 보호자(User) 한 명이 아이를 여러 명 등록할 수 있다.

    [개인정보] 이 테이블은 만 14세 미만 아동의 이름·생년월일을 담는다. 서비스 전체에서
    가장 민감한 개인정보이므로, 나중에 필드 암호화(GitHub Issue #2)를 적용한다면
    name/birth_date가 1순위 대상이다.
    """

    __tablename__ = "child_profiles"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    # 보호자가 탈퇴하면 아이 정보도 함께 지워져야 한다(개인정보보호법상 지체없는 파기).
    # ondelete="CASCADE"는 DB가 직접 자식 행을 지우게 하는 설정이다.
    user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(30), nullable=False)
    birth_date: Mapped[date] = mapped_column(Date, nullable=False)
    gender: Mapped[str] = mapped_column(String(2), nullable=False)  # "남" 또는 "여"
    # 지역은 유행병 정보(질병관리청 데이터)를 어느 지역 기준으로 보여줄지에 쓰인다.
    region_province: Mapped[str] = mapped_column(String(30), nullable=False)
    region_district: Mapped[str] = mapped_column(String(30), nullable=False)
    # 프로필 아이콘 배경색. 실제 사진이 아니라 CSS 색상 값이라 민감정보가 아니다.
    avatar_color: Mapped[str] = mapped_column(String(40), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
