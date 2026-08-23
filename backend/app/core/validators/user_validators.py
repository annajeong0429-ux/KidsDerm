import re


def validate_password(password: str) -> str:
    if len(password) < 8:
        raise ValueError("비밀번호는 8자 이상이어야 합니다.")
    if not re.search(r"[a-z]", password):
        raise ValueError("비밀번호에는 소문자, 특수문자, 숫자가 각 하나씩 포함되어야 합니다.")
    if not re.search(r"[0-9]", password):
        raise ValueError("비밀번호에는 소문자, 특수문자, 숫자가 각 하나씩 포함되어야 합니다.")
    if not re.search(r"[^a-zA-Z0-9]", password):
        raise ValueError("비밀번호에는 소문자, 특수문자, 숫자가 각 하나씩 포함되어야 합니다.")
    return password
