from passlib.context import CryptContext

# bcrypt: 비밀번호를 되돌릴 수 없는 방식으로 암호화(해시)한다. DB에는 이 해시값만 저장하고,
# 원본 비밀번호는 어디에도 저장하지 않는다.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """입력한 비밀번호를 같은 방식으로 해시해서, 저장된 해시값과 일치하는지만 비교한다."""
    return pwd_context.verify(plain_password, hashed_password)
