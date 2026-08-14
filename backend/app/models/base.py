from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """모든 테이블 모델의 공통 부모. SQLAlchemy가 이걸 보고 실제 DB 테이블을 만든다."""

    pass
