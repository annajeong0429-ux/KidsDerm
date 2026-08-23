from datetime import datetime, timedelta

from fastapi.exceptions import HTTPException
from pydantic import EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status

from app.core.config import config
from app.core.jwt.exceptions import TokenError
from app.core.jwt.tokens import AccessToken, RefreshToken
from app.core.utils.security import hash_password, verify_password
from app.dtos.auth import LoginRequest, SignUpRequest
from app.models.users import User
from app.repositories.refresh_token_repository import RefreshTokenRepository
from app.repositories.user_repository import UserRepository
from app.services.jwt import JwtService

# [로그인 시도 제한] 브루트포스(비밀번호 무차별 대입) 방어 - OWASP 권장 방식.
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_DURATION = timedelta(minutes=15)


class AuthService:
    def __init__(self):
        self.user_repo = UserRepository()
        self.refresh_token_repo = RefreshTokenRepository()
        self.jwt_service = JwtService()

    async def signup(self, session: AsyncSession, data: SignUpRequest) -> User:
        # [개인정보보호법 제23조] 이용약관/민감정보(건강정보) 동의는 법정 필수 항목이라,
        # 체크 안 하면 회원가입 자체가 성립하지 않는다. 마케팅 동의는 선택이라 검사하지 않는다.
        if not data.terms_agreed or not data.health_info_agreed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="이용약관 및 민감정보(건강정보) 수집·이용에 동의해야 회원가입할 수 있습니다.",
            )

        await self.check_email_exists(session, data.email)

        # 동의 "시각"은 클라이언트가 아니라 서버가 지금 이 순간으로 직접 찍는다.
        now = datetime.now(tz=config.TIMEZONE)
        user = await self.user_repo.create_user(
            session,
            email=data.email,
            hashed_password=hash_password(data.password),
            terms_of_service_consented_at=now,
            health_info_consented_at=now,
            marketing_consented_at=now if data.marketing_agreed else None,
        )
        await session.commit()
        return user

    async def authenticate(self, session: AsyncSession, data: LoginRequest) -> User:
        email = str(data.email)
        user = await self.user_repo.get_user_by_email(session, email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="이메일 또는 비밀번호가 올바르지 않습니다."
            )

        # [로그인 시도 제한] 이미 잠긴 상태면 비밀번호 확인 자체를 안 하고 바로 막는다.
        now = datetime.now(tz=config.TIMEZONE)
        locked_until = user.locked_until
        if locked_until is not None and locked_until.tzinfo is None:
            locked_until = locked_until.replace(tzinfo=config.TIMEZONE)
        if locked_until is not None and locked_until > now:
            remaining_minutes = max(1, int((locked_until - now).total_seconds() // 60) + 1)
            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail=f"로그인 시도 횟수를 초과해 계정이 잠겼습니다. {remaining_minutes}분 후 다시 시도해주세요.",
            )

        # 비밀번호 검증 (소셜 가입자는 hashed_password가 없다 - 동일한 에러로 막는다)
        if user.hashed_password is None or not verify_password(data.password, user.hashed_password):
            user.failed_login_attempts += 1
            if user.failed_login_attempts >= MAX_LOGIN_ATTEMPTS:
                user.locked_until = now + LOCKOUT_DURATION
            await session.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="이메일 또는 비밀번호가 올바르지 않습니다."
            )

        # 로그인 성공 - 실패 카운터/잠금 상태 초기화
        user.failed_login_attempts = 0
        user.locked_until = None
        await session.commit()

        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_423_LOCKED, detail="비활성화된 계정입니다.")

        return user

    async def login(self, session: AsyncSession, user: User) -> dict[str, AccessToken | RefreshToken]:
        await self.user_repo.update_last_login(session, user.id)
        tokens = self.jwt_service.issue_jwt_pair(user)
        # [리프레시 토큰 로테이션] 새로 발급한 리프레시 토큰의 jti를 추적 테이블에 남긴다.
        refresh_token = tokens["refresh_token"]
        await self.refresh_token_repo.create(session, user.id, refresh_token.payload["jti"])
        await session.commit()
        return tokens

    async def logout(self, session: AsyncSession, refresh_token_str: str) -> None:
        """로그아웃은 사용자 입장에서 항상 성공해야 하므로, 토큰 검증 실패는 조용히 무시한다."""
        try:
            verified_rt = self.jwt_service.verify_jwt(token=refresh_token_str, token_type="refresh")
        except TokenError:
            return
        jti = verified_rt.payload["jti"]
        await self.refresh_token_repo.revoke(session, jti)
        await session.commit()

    async def rotate_refresh_token(
        self, session: AsyncSession, refresh_token_str: str
    ) -> dict[str, AccessToken | RefreshToken]:
        """[리프레시 토큰 로테이션 + 재사용 탐지] 갱신할 때마다 토큰을 새 값으로 교체하고,
        방금 쓴 토큰은 즉시 무효화한다. 이미 무효화된 토큰이 다시 쓰이면 탈취로 간주해
        해당 계정의 모든 세션을 강제 로그아웃시킨다."""
        verified_rt = self.jwt_service.verify_jwt(token=refresh_token_str, token_type="refresh")
        jti = verified_rt.payload["jti"]

        record = await self.refresh_token_repo.get_by_jti(session, jti)
        if record is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="유효하지 않은 토큰입니다.")

        if record.is_revoked:
            await self.refresh_token_repo.revoke_all_for_user(session, record.user_id)
            await session.commit()
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="토큰 재사용이 감지되어 모든 세션이 로그아웃되었습니다. 다시 로그인해주세요.",
            )

        await self.refresh_token_repo.revoke(session, jti)

        new_refresh_token = RefreshToken()
        new_refresh_token["user_id"] = verified_rt.payload["user_id"]
        await self.refresh_token_repo.create(session, verified_rt.payload["user_id"], new_refresh_token.payload["jti"])
        await session.commit()

        return {"access_token": new_refresh_token.access_token, "refresh_token": new_refresh_token}

    async def check_email_exists(self, session: AsyncSession, email: str | EmailStr) -> None:
        if await self.user_repo.exists_by_email(session, email):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="이미 사용중인 이메일입니다.")

    async def withdraw(self, session: AsyncSession, user: User, password: str | None) -> None:
        """회원탈퇴 - 개인정보보호법상 지체없이 파기해야 하므로 소프트삭제가 아니라 즉시 완전 삭제한다."""
        if user.hashed_password is not None:
            if password is None or not verify_password(password, user.hashed_password):
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="비밀번호가 올바르지 않습니다.")
        # else: 소셜 가입자 - 비밀번호 자체가 없으므로 검증 없이 진행

        await session.delete(user)
        await session.commit()
