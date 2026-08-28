from datetime import datetime

from sqlalchemy import BigInteger, Boolean, DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class PhotoRecord(Base):
    """한 번 촬영해서 나온 "측정" 결과. 사람이 판단한 값이 아니라 AI가 사진에서 뽑아낸 수치다.

    [현재 범위] 실제 사진 파일은 아직 저장하지 않는다. 아동의 피부 사진은 민감정보라
    암호화 저장소와 보관·파기 정책이 먼저 정해져야 해서, 지금은 프론트엔드가 쓰던
    대표 색상(image_color)만 자리표시자로 저장한다.
    """

    __tablename__ = "photo_records"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    case_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True
    )
    taken_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    image_color: Mapped[str] = mapped_column(String(20), nullable=False)
    # 촬영 부위 면적 대비 병변이 차지하는 비율(%). 경과 그래프의 세로축이 이 값이다.
    area_ratio: Mapped[float] = mapped_column(Float, nullable=False)
    # [EASI 4징후] 아토피피부염 중증도를 재는 국제 표준 지표. 각 항목 0~3점 고정이며,
    # 자가보고 증상(1~5)과는 완전히 다른 척도다 - 두 척도를 절대 섞으면 안 된다.
    erythema: Mapped[int] = mapped_column(Integer, nullable=False)  # 홍반
    papulation: Mapped[int] = mapped_column(Integer, nullable=False)  # 구진
    excoriation: Mapped[int] = mapped_column(Integer, nullable=False)  # 긁은 자국
    lichenification: Mapped[int] = mapped_column(Integer, nullable=False)  # 태선화
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class SymptomRecord(Base):
    """같은 촬영 때 보호자가 직접 답한 "자가보고" 내용. 측정값(PhotoRecord)과 성격이
    달라서 테이블을 나눴다 - AI가 뽑은 수치와 사람이 느낀 증상을 구분해야
    나중에 둘을 비교·검증할 수 있다. 사진 1건당 정확히 1건이다(1:1).
    """

    __tablename__ = "symptom_records"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    # unique=True가 1:1을 보장한다 - 같은 사진에 증상 기록이 두 개 붙지 않는다.
    photo_record_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("photo_records.id", ondelete="CASCADE"), nullable=False, unique=True
    )
    # 아래 셋은 1(없음)~5(매우 심함) 자가보고 척도.
    itching: Mapped[int] = mapped_column(Integer, nullable=False)  # 가려움
    oozing: Mapped[int] = mapped_column(Integer, nullable=False)  # 진물
    pain: Mapped[int] = mapped_column(Integer, nullable=False)  # 통증
    # 발열만 척도가 아니라 실제로 잰 체온(°C)이다.
    fever_celsius: Mapped[float] = mapped_column(Float, nullable=False)
    new_lesion: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    memo: Mapped[str | None] = mapped_column(Text, nullable=True)
    # 발병 정보 - 언제부터 생겼는지, 얼마나 퍼졌는지.
    onset_timing: Mapped[str] = mapped_column(String(30), nullable=False)
    onset_timing_detail: Mapped[str | None] = mapped_column(String(100), nullable=True)
    distribution: Mapped[str] = mapped_column(String(10), nullable=False)  # 단일/부분/광범위
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
