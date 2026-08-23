from slowapi import Limiter
from slowapi.util import get_remote_address

# 계정 잠금(services/auth.py의 MAX_LOGIN_ATTEMPTS)은 "같은 계정"을 반복 공격하는 걸 막지만,
# 봇이 이메일을 바꿔가며 여러 계정을 동시에 시도하는 건 못 막는다 - 이건 "같은 IP"를 기준으로
# 별도로 막는다. 두 방어는 서로 다른 공격 패턴을 막으므로 하나가 다른 하나를 대체하지 않는다.
limiter = Limiter(key_func=get_remote_address)
