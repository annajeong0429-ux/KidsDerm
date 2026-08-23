from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse as Response
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.responses import Response as PlainResponse

from app.core.config import Env, config
from app.core.db.database import get_db
from app.core.jwt.tokens import AccessToken, RefreshToken
from app.core.rate_limit import limiter
from app.dependencies.security import get_request_user
from app.dtos.auth import LoginRequest, LoginResponse, SignUpRequest, TokenRefreshResponse, WithdrawRequest
from app.models.users import User
from app.services.auth import AuthService
from app.services.oauth_clients import get_oauth_client, supported_providers
from app.services.social_auth import SocialAuthService

auth_router = APIRouter(prefix="/auth", tags=["auth"])


def _login_response(tokens: dict[str, AccessToken | RefreshToken], status_code: int = status.HTTP_200_OK) -> Response:
    """Access Token은 body, Refresh Token은 httpOnly 쿠키 - 이메일 로그인/소셜 로그인 공통으로 쓴다."""
    resp = Response(
        content=LoginResponse(access_token=str(tokens["access_token"])).model_dump(), status_code=status_code
    )
    resp.set_cookie(
        key="refresh_token",
        value=str(tokens["refresh_token"]),
        httponly=True,
        secure=config.ENV == Env.PROD,
        domain=config.COOKIE_DOMAIN or None,
        expires=tokens["access_token"].payload["exp"],
    )
    return resp


@auth_router.post(
    "/signup",
    status_code=status.HTTP_201_CREATED,
    summary="이메일 회원가입",
    responses={
        status.HTTP_409_CONFLICT: {"description": "이메일이 이미 사용 중"},
        status.HTTP_422_UNPROCESSABLE_CONTENT: {"description": "비밀번호 형식이 유효하지 않음"},
        status.HTTP_429_TOO_MANY_REQUESTS: {"description": "같은 IP에서 짧은 시간에 너무 많은 요청"},
    },
)
@limiter.limit("5/minute")
async def signup(
    request: Request,
    body: SignUpRequest,
    session: Annotated[AsyncSession, Depends(get_db)],
    auth_service: Annotated[AuthService, Depends(AuthService)],
) -> Response:
    await auth_service.signup(session, body)
    return Response(content={"detail": "회원가입이 성공적으로 완료되었습니다."}, status_code=status.HTTP_201_CREATED)


@auth_router.post(
    "/login",
    response_model=LoginResponse,
    status_code=status.HTTP_200_OK,
    summary="로그인",
    description=(
        "이메일/비밀번호를 검증하고 JWT를 발급한다. Access Token은 응답 body로 오고, "
        "Refresh Token은 httpOnly 쿠키(Set-Cookie: refresh_token)로 내려간다."
    ),
    responses={
        status.HTTP_400_BAD_REQUEST: {"description": "이메일 또는 비밀번호가 올바르지 않음"},
        status.HTTP_423_LOCKED: {"description": "비활성화된 계정 또는 로그인 시도 초과로 잠김"},
        status.HTTP_429_TOO_MANY_REQUESTS: {"description": "같은 IP에서 짧은 시간에 너무 많은 요청"},
    },
)
@limiter.limit("10/minute")
async def login(
    request: Request,
    body: LoginRequest,
    session: Annotated[AsyncSession, Depends(get_db)],
    auth_service: Annotated[AuthService, Depends(AuthService)],
) -> Response:
    user = await auth_service.authenticate(session, body)
    tokens = await auth_service.login(session, user)
    return _login_response(tokens)


@auth_router.get(
    "/token/refresh",
    response_model=TokenRefreshResponse,
    status_code=status.HTTP_200_OK,
    summary="액세스 토큰 재발급",
    description=(
        "쿠키의 refresh_token으로 새 Access Token을 발급한다. [로테이션] 이때 refresh_token 자체도 "
        "새 값으로 교체되고 쿠키가 갱신된다 - 예전 refresh_token은 즉시 무효화된다."
    ),
    responses={
        status.HTTP_401_UNAUTHORIZED: {"description": "refresh_token 쿠키가 없거나 만료/무효화됨"},
    },
)
async def token_refresh(
    session: Annotated[AsyncSession, Depends(get_db)],
    auth_service: Annotated[AuthService, Depends(AuthService)],
    refresh_token: Annotated[str | None, Cookie()] = None,
) -> Response:
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token is missing.")
    tokens = await auth_service.rotate_refresh_token(session, refresh_token)
    resp = Response(
        content=TokenRefreshResponse(access_token=str(tokens["access_token"])).model_dump(),
        status_code=status.HTTP_200_OK,
    )
    resp.set_cookie(
        key="refresh_token",
        value=str(tokens["refresh_token"]),
        httponly=True,
        secure=config.ENV == Env.PROD,
        domain=config.COOKIE_DOMAIN or None,
        expires=tokens["access_token"].payload["exp"],
    )
    return resp


@auth_router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="로그아웃",
    description="refresh_token 쿠키를 무효화(revoke)하고 쿠키를 삭제한다. 항상 성공한다.",
)
async def logout(
    request: Request,
    session: Annotated[AsyncSession, Depends(get_db)],
    auth_service: Annotated[AuthService, Depends(AuthService)],
) -> PlainResponse:
    refresh_token_str = request.cookies.get("refresh_token")
    if refresh_token_str:
        await auth_service.logout(session, refresh_token_str)
    resp = PlainResponse(status_code=status.HTTP_204_NO_CONTENT)
    resp.delete_cookie(key="refresh_token", domain=config.COOKIE_DOMAIN or None)
    return resp


@auth_router.delete(
    "/withdraw",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="회원탈퇴",
    description="본인 확인용 현재 비밀번호를 재확인한 뒤, 계정을 즉시 완전 삭제한다.",
)
async def withdraw(
    request: WithdrawRequest,
    user: Annotated[User, Depends(get_request_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
    auth_service: Annotated[AuthService, Depends(AuthService)],
) -> None:
    await auth_service.withdraw(session, user, request.password)


@auth_router.get(
    "/{provider}/login",
    summary="소셜 로그인 시작",
    description="해당 provider의 동의 화면으로 리다이렉트한다. 지원 provider: "
    + ", ".join(supported_providers())
    + ".",
    responses={status.HTTP_404_NOT_FOUND: {"description": "지원하지 않는 provider"}},
)
async def social_login(provider: str) -> RedirectResponse:
    if provider not in supported_providers():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"지원하지 않는 provider입니다: {provider}")
    client = get_oauth_client(provider)
    return RedirectResponse(client.get_authorize_url())


@auth_router.get(
    "/{provider}/callback",
    summary="소셜 로그인 콜백",
    description=(
        "provider가 이 주소로 code를 담아 리다이렉트해온다. 기존 계정이면 로그인, 신규면 이 시점에 "
        "곧바로 계정을 생성한다. 처리 후 refresh_token 쿠키를 심고 FRONTEND_URL(홈)로 리다이렉트한다."
    ),
    responses={
        status.HTTP_404_NOT_FOUND: {"description": "지원하지 않는 provider"},
        status.HTTP_409_CONFLICT: {"description": "이미 다른 방식(이메일 등)으로 가입된 이메일"},
    },
)
async def social_callback(
    provider: str,
    code: str,
    session: Annotated[AsyncSession, Depends(get_db)],
    social_auth_service: Annotated[SocialAuthService, Depends(SocialAuthService)],
) -> RedirectResponse:
    if provider not in supported_providers():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"지원하지 않는 provider입니다: {provider}")

    client = get_oauth_client(provider)
    userinfo = await client.fetch_userinfo(code)
    tokens = await social_auth_service.handle_callback(session, provider, userinfo)

    # Access Token은 body로 못 내려준다(브라우저 리다이렉트라 body를 못 읽음) - refresh_token 쿠키만
    # 심어두면, 프론트가 홈 로딩 시 자동으로 /auth/token/refresh를 호출해서 access_token을 받아간다.
    redirect = RedirectResponse(config.FRONTEND_URL + "/")
    redirect.set_cookie(
        key="refresh_token",
        value=str(tokens["refresh_token"]),
        httponly=True,
        secure=config.ENV == Env.PROD,
        domain=config.COOKIE_DOMAIN or None,
        expires=tokens["access_token"].payload["exp"],
    )
    return redirect
