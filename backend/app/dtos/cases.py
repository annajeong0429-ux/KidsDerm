from datetime import datetime
from typing import Annotated, Literal

from pydantic import BaseModel, Field

from app.models.cases import Case
from app.models.records import PhotoRecord, SymptomRecord

TrendStatus = Literal["호전", "유지", "확대 추세"]


class FourSignsDto(BaseModel):
    """[EASI 4징후] 국제 표준 지표라 각 항목이 0~3점으로 고정돼 있다.
    자가보고 증상(1~5)과 척도가 다르므로 절대 섞어 쓰지 않는다."""

    erythema: Annotated[int, Field(description="홍반", ge=0, le=3)]
    papulation: Annotated[int, Field(description="구진", ge=0, le=3)]
    excoriation: Annotated[int, Field(description="긁은 자국", ge=0, le=3)]
    lichenification: Annotated[int, Field(description="태선화", ge=0, le=3)]


class SymptomDto(BaseModel):
    """보호자 자가보고. 가려움·진물·통증은 1(없음)~5(매우 심함) 척도이고,
    발열만 척도가 아니라 실제로 잰 체온(°C)이다."""

    itching: Annotated[int, Field(description="가려움 1~5", ge=1, le=5)]
    oozing: Annotated[int, Field(description="진물 1~5", ge=1, le=5)]
    pain: Annotated[int, Field(description="통증 1~5", ge=1, le=5)]
    fever_celsius: Annotated[float, Field(description="실측 체온(°C)", ge=30.0, le=45.0)]
    new_lesion: Annotated[bool, Field(False, description="새로운 부위에 병변이 생겼는지")]
    memo: Annotated[str | None, Field(None, description="자유 메모", max_length=1000)]
    onset_timing: Annotated[str, Field(description="언제부터 생겼는지", max_length=30)]
    onset_timing_detail: Annotated[
        str | None, Field(None, description='발병 시점을 "기타"로 고른 경우 직접 적은 내용', max_length=100)
    ]
    distribution: Annotated[Literal["단일", "부분", "광범위"], Field(description="병변 분포 범위")]


class RecordCreateRequest(BaseModel):
    """촬영 한 번으로 만들어지는 기록 전체(사진 측정값 + 자가보고)를 한 번에 받는다.
    프론트엔드의 기록 흐름이 여러 화면에 걸쳐 모은 값을 마지막에 한 번만 저장하기 때문이다."""

    body_part: Annotated[str, Field(description="촬영 부위", max_length=40)]
    body_part_detail: Annotated[
        str | None, Field(None, description='부위를 "기타"로 고른 경우 직접 적은 내용', max_length=100)
    ]
    taken_at: Annotated[datetime | None, Field(None, description="촬영 시각. 비우면 서버 시각을 쓴다.")]
    image_color: Annotated[str, Field(description="사진 대표 색상(실제 이미지 저장 전까지 쓰는 자리표시자)", max_length=20)]
    # [주의] area_ratio와 signs는 원래 AI 모델이 사진에서 계산해야 하는 값이다. 모델이 아직
    # 붙지 않아 지금은 클라이언트가 흉내낸 값을 보내온다. 실제 모델이 연동되면 서버가 업로드된
    # 이미지로 직접 계산해야 하며, 그때는 이 두 필드를 요청에서 받지 말아야 한다
    # (클라이언트가 보낸 의학적 측정값을 그대로 믿으면 기록을 마음대로 조작할 수 있다).
    area_ratio: Annotated[float, Field(description="병변 면적 비율(%) - 추후 서버 계산으로 이전", ge=0, le=100)]
    signs: Annotated[FourSignsDto, Field(description="EASI 4징후 - 추후 서버 계산으로 이전")]
    symptoms: Annotated[SymptomDto, Field(description="보호자 자가보고 증상")]


class SymptomResponse(SymptomDto):
    id: int

    @classmethod
    def from_model(cls, symptom: SymptomRecord) -> "SymptomResponse":
        return cls(
            id=symptom.id,
            itching=symptom.itching,
            oozing=symptom.oozing,
            pain=symptom.pain,
            fever_celsius=symptom.fever_celsius,
            new_lesion=symptom.new_lesion,
            memo=symptom.memo,
            onset_timing=symptom.onset_timing,
            onset_timing_detail=symptom.onset_timing_detail,
            distribution=symptom.distribution,
        )


class PhotoRecordResponse(BaseModel):
    id: int
    case_id: int
    taken_at: datetime
    image_color: str
    # 실제 사진이 올라와 있는지. True면 GET /photos/{id}/image 로 내려받을 수 있다.
    # 사진 자체는 이 응답에 담지 않는다 - 목록 한 번에 이미지를 다 실어보내면 너무 무겁다.
    has_image: bool
    area_ratio: float
    signs: FourSignsDto
    symptoms: SymptomResponse | None

    @classmethod
    def from_model(cls, photo: PhotoRecord, symptom: SymptomRecord | None) -> "PhotoRecordResponse":
        return cls(
            id=photo.id,
            case_id=photo.case_id,
            taken_at=photo.taken_at,
            image_color=photo.image_color,
            has_image=photo.image_path is not None,
            area_ratio=photo.area_ratio,
            signs=FourSignsDto(
                erythema=photo.erythema,
                papulation=photo.papulation,
                excoriation=photo.excoriation,
                lichenification=photo.lichenification,
            ),
            symptoms=SymptomResponse.from_model(symptom) if symptom else None,
        )


class CaseResponse(BaseModel):
    """사례 요약. status/baseline/latest/days_observed는 DB에 저장된 값이 아니라
    이 사례에 달린 사진 기록으로부터 조회할 때마다 계산한 값이다."""

    id: int
    child_id: int
    body_part: str
    body_part_detail: str | None
    created_at: datetime
    active: bool
    status: TrendStatus
    baseline_area_ratio: float
    latest_area_ratio: float
    days_observed: int
    photo_count: int


class CaseDetailResponse(CaseResponse):
    photos: list[PhotoRecordResponse]


class RecordCreateResponse(BaseModel):
    """기록을 저장하면, 그 기록이 어느 사례에 붙었는지도 함께 알려준다
    (같은 부위의 진행 중인 사례가 있으면 거기에 붙고, 없으면 사례가 새로 만들어진다)."""

    case: CaseResponse
    photo: PhotoRecordResponse
    case_created: Annotated[bool, Field(description="이번 저장으로 사례가 새로 만들어졌는지")]


class CaseUpdateRequest(BaseModel):
    active: Annotated[bool, Field(description="False로 바꾸면 관찰 종료(지난 사례로 이동)")]
