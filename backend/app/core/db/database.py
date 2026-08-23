from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import config

DATABASE_URL = (
    f"mysql+asyncmy://{config.DB_USER}:{config.DB_PASSWORD}@{config.DB_HOST}:{config.DB_PORT}/{config.DB_NAME}"
)

engine = create_async_engine(
    DATABASE_URL,
    pool_size=config.DB_CONNECTION_POOL_MAXSIZE,
    connect_args={"connect_timeout": config.DB_CONNECT_TIMEOUT},
)

AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def get_db() -> AsyncGenerator[AsyncSession]:
    """FastAPI가 각 요청마다 이 함수를 호출해서, 요청이 끝나면 세션을 자동으로 닫아준다."""
    async with AsyncSessionLocal() as session:
        yield session
