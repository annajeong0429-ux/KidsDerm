import uuid
import zoneinfo
from dataclasses import field
from enum import StrEnum

from pydantic_settings import BaseSettings, SettingsConfigDict


class Env(StrEnum):
    LOCAL = "local"
    DEV = "dev"
    PROD = "prod"


# SECRET_KEY를 안 채우고 그냥 켰을 때 쓰이는 표시(placeholder) 값. 서버가 켜질 때마다
# uuid만 새로 붙어 값 자체는 매번 달라지지만, 이 접두사로 "실제로 설정 안 한 상태"임을 구분한다.
_UNSET_SECRET_KEY_PREFIX = "unset-default-secret-key-"


class Config(BaseSettings):
    """환경변수(.env 파일 또는 실제 OS 환경변수)에서 값을 읽어온다.
    값이 없으면 아래 적어둔 기본값을 그대로 쓴다 (그래서 로컬 개발은 .env 없이도 일단 실행된다)."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="allow")

    ENV: Env = Env.LOCAL
    SECRET_KEY: str = f"{_UNSET_SECRET_KEY_PREFIX}{uuid.uuid4().hex}"
    TIMEZONE: zoneinfo.ZoneInfo = field(default_factory=lambda: zoneinfo.ZoneInfo("Asia/Seoul"))

    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = "pw1234"
    DB_NAME: str = "kidsderm"
    DB_CONNECT_TIMEOUT: int = 5
    DB_CONNECTION_POOL_MAXSIZE: int = 10

    # 로그인 유지에 쓰는 refresh_token 쿠키를 어느 도메인에서 유효하게 할지.
    COOKIE_DOMAIN: str = "localhost"

    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 14 * 24 * 60
    JWT_LEEWAY: int = 5

    # [사진 저장] 촬영 이미지는 DB가 아니라 파일로 저장한다(용량이 크고 DB 백업을 무겁게 만든다).
    # 도커 볼륨을 여기에 붙여서 컨테이너를 지워도 사진이 남게 한다.
    PHOTO_STORAGE_DIR: str = "/data/photos"
    # 아동의 피부 사진은 민감정보라 파일을 그대로 두지 않고 암호화해서 저장한다.
    # 32바이트 키를 base64로 넣는다. 비워두면 로컬 개발용 임시 키가 자동 생성된다.
    PHOTO_ENCRYPTION_KEY: str = ""
    # 업로드 상한. 요즘 휴대폰 사진이 5MB 안팎이라 10MB면 충분하다.
    PHOTO_MAX_BYTES: int = 10 * 1024 * 1024

    # 소셜 로그인 콜백 처리가 끝나면 이 주소(프론트엔드)로 돌려보낸다.
    FRONTEND_URL: str = "http://localhost:3000"

    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/google/callback"

    KAKAO_CLIENT_ID: str = ""
    KAKAO_CLIENT_SECRET: str = ""
    KAKAO_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/kakao/callback"

    NAVER_CLIENT_ID: str = ""
    NAVER_CLIENT_SECRET: str = ""
    NAVER_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/naver/callback"


# 다른 파일들은 이 인스턴스 하나를 계속 재사용한다: `from app.core.config import config`
config = Config()

# [보안] 운영 환경에서 SECRET_KEY를 안 채웠거나 너무 짧으면, 서버가 아예 뜨지 않게 막는다.
# SECRET_KEY는 모든 JWT(로그인 상태)의 서명 키다 - 짧거나 예측 가능하면 공격자가 토큰을
# 위조해서 아무 계정으로나 로그인한 것처럼 꾸밀 수 있다. 로컬/개발 환경은 편의상 통과시킨다.
if config.ENV == Env.PROD:
    if config.SECRET_KEY.startswith(_UNSET_SECRET_KEY_PREFIX):
        raise RuntimeError(
            "SECRET_KEY가 설정되지 않았습니다. 운영 환경(.env)에 SECRET_KEY를 반드시 채워주세요."
        )
    if len(config.SECRET_KEY) < 32:
        raise RuntimeError(
            f"SECRET_KEY가 너무 짧습니다({len(config.SECRET_KEY)}자). 32자 이상의 무작위 문자열을 사용하세요."
        )
    # 사진 암호화 키도 마찬가지다. 키가 없으면 서버를 켤 때마다 임시 키가 새로 생겨서,
    # 어제 저장한 사진을 오늘 못 여는 상황이 된다 - 운영에서는 반드시 고정된 키를 준다.
    if not config.PHOTO_ENCRYPTION_KEY:
        raise RuntimeError(
            "PHOTO_ENCRYPTION_KEY가 설정되지 않았습니다. 운영 환경(.env)에 32바이트 키를 base64로 넣어주세요."
        )
