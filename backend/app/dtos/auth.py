from typing import Annotated

from pydantic import AfterValidator, BaseModel, EmailStr, Field

from app.core.validators import validate_password


class SignUpRequest(BaseModel):
    email: Annotated[
        EmailStr,
        Field(description="로그인 아이디로 쓰이는 이메일. 중복 시 409를 반환한다.", max_length=40),
    ]
    password: Annotated[
        str,
        Field(description="소문자, 숫자, 특수문자를 각 1개 이상 포함, 8자 이상.", min_length=8),
        AfterValidator(validate_password),
    ]
    # 동의 "여부"만 클라이언트가 보낸다 - 동의 "시각"은 서버가 요청을 받은 시점으로 직접
    # 찍는다(클라이언트 시계는 신뢰하지 않는다). 필수 2종은 False면 회원가입 자체가 거부된다.
    terms_agreed: Annotated[bool, Field(description="이용약관 동의 여부 (필수)")]
    health_info_agreed: Annotated[bool, Field(description="민감정보(건강정보) 수집·이용 동의 여부 (필수)")]
    marketing_agreed: Annotated[bool, Field(False, description="마케팅 정보 수신 동의 여부 (선택)")]


class LoginRequest(BaseModel):
    email: EmailStr
    password: Annotated[str, Field(min_length=8)]


class WithdrawRequest(BaseModel):
    """회원탈퇴 - 탈취된 토큰만으로 탈퇴되는 것을 막기 위해 현재 비밀번호 재확인을 요구한다.
    소셜 가입자는 비밀번호가 없으므로 생략 가능하다."""

    password: Annotated[str | None, Field(None, min_length=8)]


class LoginResponse(BaseModel):
    access_token: Annotated[
        str,
        Field(description="Authorization: Bearer 헤더에 담아 보낸다. Refresh Token은 httpOnly 쿠키로 내려간다."),
    ]


class TokenRefreshResponse(LoginResponse): ...
