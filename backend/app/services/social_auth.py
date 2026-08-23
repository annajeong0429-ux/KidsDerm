from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status

from app.core.jwt.tokens import AccessToken, RefreshToken
from app.repositories.refresh_token_repository import RefreshTokenRepository
from app.repositories.user_repository import UserRepository
from app.services.jwt import JwtService
from app.services.oauth_clients import SocialUserInfo


class SocialAuthService:
    """소셜 로그인 콜백 처리. provider가 이메일+닉네임을 이미 주기 때문에, 비밀번호 없이
    그 정보만으로 곧바로 계정을 만들 수 있다 - 콜백 한 번에 로그인 또는 신규 가입까지 끝낸다."""

    def __init__(self):
        self.user_repo = UserRepository()
        self.refresh_token_repo = RefreshTokenRepository()
        self.jwt_service = JwtService()

    async def handle_callback(
        self, session: AsyncSession, provider: str, userinfo: SocialUserInfo
    ) -> dict[str, AccessToken | RefreshToken]:
        user = await self.user_repo.get_by_sns(session, provider, userinfo.sns_id)

        if user is None:
            # 신규 - 이메일이 이미 다른 방식(이메일 가입 등)으로 쓰이고 있으면 막는다.
            if await self.user_repo.exists_by_email(session, userinfo.email):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="이미 이 이메일로 가입된 계정이 있습니다. 이메일로 로그인해주세요.",
                )
            user = await self.user_repo.create_social_user(
                session, email=userinfo.email, sns_provider=provider, sns_id=userinfo.sns_id
            )

        await self.user_repo.update_last_login(session, user.id)
        tokens = self.jwt_service.issue_jwt_pair(user)
        refresh_token = tokens["refresh_token"]
        await self.refresh_token_repo.create(session, user.id, refresh_token.payload["jti"])
        await session.commit()
        return tokens
