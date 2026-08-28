from datetime import date
from typing import Annotated, Literal

from pydantic import BaseModel, Field

from app.models.child_profiles import ChildProfile


class RegionDto(BaseModel):
    province: Annotated[str, Field(description="시/도 (예: 대전광역시)", max_length=30)]
    district: Annotated[str, Field(description="시/군/구 (예: 유성구)", max_length=30)]


class ChildProfileCreateRequest(BaseModel):
    name: Annotated[str, Field(description="아이 이름", min_length=1, max_length=30)]
    birth_date: Annotated[date, Field(description="생년월일 (YYYY-MM-DD)")]
    gender: Annotated[Literal["남", "여"], Field(description="성별")]
    region: Annotated[RegionDto, Field(description="거주 지역 - 지역 유행병 정보를 보여주는 기준")]
    avatar_color: Annotated[str, Field(description="프로필 아이콘 배경색(CSS 값)", max_length=40)]


class ChildProfileUpdateRequest(BaseModel):
    """수정은 전체 덮어쓰기(PUT) 방식이라 생성과 동일한 항목을 모두 받는다."""

    name: Annotated[str, Field(min_length=1, max_length=30)]
    birth_date: date
    gender: Literal["남", "여"]
    region: RegionDto
    avatar_color: Annotated[str, Field(max_length=40)]


class ChildProfileResponse(BaseModel):
    id: int
    name: str
    birth_date: date
    gender: str
    region: RegionDto
    avatar_color: str

    @classmethod
    def from_model(cls, child: ChildProfile) -> "ChildProfileResponse":
        """DB 모델은 region_province/region_district로 납작하게 저장하지만,
        API로 나갈 때는 프론트엔드가 쓰기 편하도록 region 객체로 다시 묶어준다."""
        return cls(
            id=child.id,
            name=child.name,
            birth_date=child.birth_date,
            gender=child.gender,
            region=RegionDto(province=child.region_province, district=child.region_district),
            avatar_color=child.avatar_color,
        )
