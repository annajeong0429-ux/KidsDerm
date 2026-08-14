from calendar import timegm
from datetime import datetime, timedelta
from typing import Any, Self
from uuid import uuid4

from app.core.config import config
from app.core.jwt.exceptions import ExpiredTokenError, TokenBackendError, TokenBackendExpiredError, TokenError
from app.core.jwt.state import token_backend
from app.models.users import User


class Token:
    """Access Token과 Refresh Token의 공통 부모 클래스.

    토큰의 실제 내용물(payload)은 그냥 파이썬 dict다 - 이 dict를 서명해서 문자열로
    바꾸면(str(token)) 그게 JWT 문자열이 되고, 그 문자열을 다시 이 클래스로 감싸면
    (Token(token=문자열)) 서명을 검증하고 payload를 복원한다.
    """

    token_type: str | None = None
    lifetime: timedelta | None = None

    def __init__(self, token: str | None = None, verify: bool = True) -> None:
        if not self.token_type:
            raise TokenError("token_type must be set")
        if not self.lifetime:
            raise TokenError("lifetime must be set")

        self.token = token
        self.current_time = datetime.now(tz=config.TIMEZONE)
        self.payload: dict[str, Any] = {}

        if token is not None:
            # 기존 토큰 문자열을 검증하며 복원하는 경우 (예: 클라이언트가 보낸 Authorization 헤더)
            try:
                self.payload = token_backend.decode(token, verify=verify)
            except TokenBackendExpiredError as err:
                raise ExpiredTokenError("Token is expired") from err
            except TokenBackendError as err:
                raise TokenError("Token is invalid") from err
        else:
            # 새 토큰을 새로 발급하는 경우 (예: 로그인 성공 시)
            self.payload = {"type": self.token_type}
            self.set_exp(from_time=self.current_time, lifetime=self.lifetime)
            self.set_jti()

    def __getitem__(self, key: str) -> Any:
        return self.payload[key]

    def __setitem__(self, key: str, value: Any) -> None:
        self.payload[key] = value

    def __str__(self) -> str:
        """이 토큰을 서명된 JWT 문자열로 만든다 (응답으로 내려주거나 쿠키에 담을 때 사용)."""
        return token_backend.encode(self.payload)

    def set_exp(self, from_time: datetime | None = None, lifetime: timedelta | None = None) -> None:
        from_time = from_time or self.current_time
        lifetime = lifetime or self.lifetime
        assert lifetime is not None
        self.payload["exp"] = timegm((from_time + lifetime).timetuple())

    def set_jti(self) -> None:
        """jti = JWT ID. 토큰마다 겹치지 않는 고유 번호 - 이걸로 "이 토큰 한 번 썼는지"를 추적한다."""
        self.payload["jti"] = uuid4().hex

    @classmethod
    def for_user(cls, user: User) -> Self:
        token = cls()
        token["user_id"] = user.id
        return token


class AccessToken(Token):
    token_type = "access"
    lifetime = timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES)


class RefreshToken(Token):
    token_type = "refresh"
    lifetime = timedelta(minutes=config.REFRESH_TOKEN_EXPIRE_MINUTES)
    no_copy_claims = ("type", "exp", "jti")

    @property
    def access_token(self) -> AccessToken:
        """이 Refresh Token과 같은 사용자 정보를 담은 Access Token을 새로 만든다."""
        access = AccessToken()
        access.set_exp(from_time=self.current_time)
        for claim, value in self.payload.items():
            if claim in self.no_copy_claims:
                continue
            access[claim] = value
        return access
