from app.core.config import config
from app.core.jwt.backends import TokenBackend

# 앱 전체에서 이 하나의 TokenBackend만 재사용한다 (서명 키·알고리즘을 매번 새로 안 만들도록).
token_backend = TokenBackend(
    algorithm=config.JWT_ALGORITHM,
    signing_key=config.SECRET_KEY,
    leeway=config.JWT_LEEWAY,
)
