from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.apis.v1.auth_routers import auth_router
from app.apis.v1.case_routers import case_router, record_router
from app.apis.v1.child_routers import child_router
from app.apis.v1.medical_routers import diagnosis_item_router, diagnosis_router
from app.apis.v1.user_routers import user_router
from app.core.config import config
from app.core.db.database import engine
from app.core.rate_limit import limiter
from app.models.base import Base

# 아래 import 두 개는 실제로는 안 쓰지만, Base.metadata가 이 테이블들을 알게 하려면
# 모델 파일이 한 번은 import돼야 한다 (SQLAlchemy가 테이블 정의를 "등록"하는 방식).
from app.models import (  # noqa: F401
    cases,
    child_profiles,
    issued_refresh_token,
    medical,
    records,
    users,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 서버가 켜질 때, 아직 없는 테이블이 있으면 자동으로 만들어준다.
    # (Alembic 같은 정식 마이그레이션 도구 없이, 로그인 전용 소규모 서비스라 이 정도로 충분하다.)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(title="kidsderm-ai auth backend", lifespan=lifespan)

# [IP 로그인 시도 제한] 계정 잠금과 별개로, 같은 IP에서 짧은 시간에 몰아치는 요청 자체를 막는다.
# 어떤 라우트에 얼마나 걸었는지는 apis/v1/auth_routers.py의 @limiter.limit(...) 참고.
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    # 프론트엔드(Next.js, 3000번 포트)에서 오는 요청만 허용한다.
    allow_origins=[config.FRONTEND_URL],
    # 쿠키(refresh_token)를 주고받으려면 반드시 True여야 한다.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1")
app.include_router(user_router, prefix="/api/v1")
app.include_router(child_router, prefix="/api/v1")
app.include_router(case_router, prefix="/api/v1")
app.include_router(record_router, prefix="/api/v1")
app.include_router(diagnosis_router, prefix="/api/v1")
app.include_router(diagnosis_item_router, prefix="/api/v1")


@app.get("/", tags=["health"])
async def health_check() -> dict[str, str]:
    return {"status": "ok"}
