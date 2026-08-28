"""촬영 사진을 암호화해서 파일로 저장하고 다시 읽어오는 곳.

[왜 암호화하나]
아동의 피부 병변 사진은 이 서비스에서 가장 민감한 정보다. 서버 디스크나 백업본이
통째로 유출되더라도 사진 자체는 열 수 없어야 하므로, 파일을 그대로 두지 않고
AES-256-GCM으로 암호화해서 저장한다. GCM은 암호화와 동시에 위·변조 검사도 해줘서,
누군가 파일을 몰래 고쳐두면 복호화 단계에서 바로 실패한다.
"""

import base64
import os
import secrets
import uuid
from pathlib import Path

from cryptography.exceptions import InvalidTag
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from app.core.config import config

# 허용할 이미지 형식. 사용자가 보낸 Content-Type을 그대로 믿지 않고,
# 파일 앞부분의 고유한 바이트(매직 넘버)로 실제 형식을 다시 확인한다.
ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp"}

_MAGIC: list[tuple[bytes, str]] = [
    (b"\xff\xd8\xff", "image/jpeg"),
    (b"\x89PNG\r\n\x1a\n", "image/png"),
]

# AES-GCM 표준 권장 nonce 길이(12바이트). 파일 맨 앞에 붙여서 함께 저장한다.
_NONCE_LEN = 12


class PhotoStorageError(Exception):
    """저장·복호화 중 생긴 문제. 라우터에서 사용자에게 보여줄 메시지로 바꾼다."""


def detect_mime(data: bytes) -> str | None:
    """파일 내용만 보고 실제 이미지 형식을 알아낸다. 확장자나 Content-Type은 위조할 수 있다."""
    for magic, mime in _MAGIC:
        if data.startswith(magic):
            return mime
    # WEBP는 "RIFF????WEBP" 형태라 앞 4바이트만으로는 판별이 안 된다.
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "image/webp"
    return None


def _key() -> bytes:
    """설정에서 암호화 키를 읽어온다. 로컬 개발에서 키를 안 넣었으면 임시 키를 만들어 쓴다
    (서버를 다시 켜면 이전 사진은 못 열지만, 개발 중에는 문제가 되지 않는다)."""
    raw = config.PHOTO_ENCRYPTION_KEY
    if not raw:
        # 운영 환경은 config.py에서 이미 막아뒀으므로 여기 오는 건 로컬뿐이다.
        return _local_dev_key()
    try:
        key = base64.b64decode(raw)
    except Exception as exc:
        raise PhotoStorageError("PHOTO_ENCRYPTION_KEY가 올바른 base64가 아닙니다.") from exc
    if len(key) != 32:
        raise PhotoStorageError(f"PHOTO_ENCRYPTION_KEY는 32바이트여야 합니다(현재 {len(key)}바이트).")
    return key


_dev_key: bytes | None = None


def _local_dev_key() -> bytes:
    global _dev_key
    if _dev_key is None:
        _dev_key = secrets.token_bytes(32)
    return _dev_key


def _storage_root() -> Path:
    root = Path(config.PHOTO_STORAGE_DIR)
    root.mkdir(parents=True, exist_ok=True)
    return root


def save(data: bytes, *, case_id: int) -> str:
    """사진을 암호화해서 저장하고, DB에 적어둘 상대 경로를 돌려준다.

    사례별 폴더로 나눠 담는다 - 한 폴더에 파일이 수만 개 쌓이면 느려지고,
    한 사례의 사진은 함께 생기고 함께 지워지므로 묶어두는 편이 관리하기 쉽다.
    """
    nonce = os.urandom(_NONCE_LEN)
    blob = nonce + AESGCM(_key()).encrypt(nonce, data, None)

    relative = f"{case_id}/{uuid.uuid4().hex}.enc"
    target = _storage_root() / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(blob)
    return relative


def load(relative_path: str) -> bytes:
    """저장된 사진을 복호화해서 원본 바이트로 돌려준다."""
    target = _safe_path(relative_path)
    if not target.exists():
        raise PhotoStorageError("사진 파일을 찾을 수 없습니다.")
    blob = target.read_bytes()
    nonce, ciphertext = blob[:_NONCE_LEN], blob[_NONCE_LEN:]
    try:
        return AESGCM(_key()).decrypt(nonce, ciphertext, None)
    except InvalidTag as exc:
        # 키가 바뀌었거나 파일이 손상·변조된 경우.
        raise PhotoStorageError("사진을 복호화하지 못했습니다.") from exc


def delete(relative_path: str) -> None:
    """사진 파일을 지운다. 이미 없으면 조용히 넘어간다(지우는 게 목적이므로)."""
    try:
        _safe_path(relative_path).unlink(missing_ok=True)
    except PhotoStorageError:
        # 경로가 이상한 값이면 지울 것도 없다.
        return


def delete_many(relative_paths: list[str]) -> None:
    for path in relative_paths:
        delete(path)


def _safe_path(relative_path: str) -> Path:
    """저장 폴더 밖으로 나가는 경로를 막는다.

    "../../etc/passwd" 같은 값이 DB에 들어갔을 때 그대로 따라가면 엉뚱한 파일을
    읽거나 지우게 된다. 실제 경로로 펼친 뒤 저장 폴더 안에 있는지 확인한다.
    """
    root = _storage_root().resolve()
    target = (root / relative_path).resolve()
    if not target.is_relative_to(root):
        raise PhotoStorageError("허용되지 않은 파일 경로입니다.")
    return target
