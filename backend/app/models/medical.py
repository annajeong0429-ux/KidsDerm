from datetime import date, datetime

from sqlalchemy import BigInteger, Boolean, Date, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Diagnosis(Base):
    """병원에 다녀와서 보호자가 입력한 진단 내용.

    [중요] 이건 앱이 내린 판단이 아니라, 의료진이 내린 진단을 보호자가 받아 적은 기록이다.
    앱의 AI 분석 결과와 이 진단을 나란히 두고 보는 것이 이 서비스의 핵심이다.
    """

    __tablename__ = "diagnoses"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    case_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True
    )
    visited_on: Mapped[date] = mapped_column(Date, nullable=False)
    hospital_name: Mapped[str] = mapped_column(String(60), nullable=False)
    diagnosis_name: Mapped[str] = mapped_column(String(60), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Prescription(Base):
    """진단에 딸린 처방. 진단 1건에 약이 여러 개일 수 있어서 1:N이다.
    경과 그래프에 "이 시점에 약을 쓰기 시작했다"는 세로선을 그리는 근거 데이터이기도 하다.
    """

    __tablename__ = "prescriptions"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    diagnosis_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("diagnoses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    medication_name: Mapped[str] = mapped_column(String(60), nullable=False)
    form: Mapped[str] = mapped_column(String(10), nullable=False)  # 연고/경구/기타
    duration_days: Mapped[int] = mapped_column(Integer, nullable=False)
    note: Mapped[str | None] = mapped_column(String(200), nullable=True)
    next_visit_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    # 촬영 리마인더를 며칠 주기로 보낼지(1~3일). reminder_on이 False면 주기와 무관하게 안 보낸다.
    reminder_cycle_days: Mapped[int] = mapped_column(Integer, default=2, nullable=False)
    reminder_on: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
