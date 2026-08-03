import re
from datetime import datetime, timedelta, timezone
from typing import Optional, Any
import jwt
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["pbkdf2_sha256", "bcrypt"], deprecated="auto")

def validate_password_complexity(password: str) -> tuple[bool, str]:
    """
    Valida las reglas estrictas de contraseña VENDIX Enterprise:
    - Mínimo 12 caracteres.
    - Al menos una letra mayúscula.
    - Al menos una letra minúscula.
    - Al menos un número.
    - Al menos un símbolo especial (!@#$%^&*()_+-=[]{}|;:,.<>?).
    """
    if len(password) < 12:
        return False, "La contraseña debe contener al menos 12 caracteres."
    if not re.search(r"[A-Z]", password):
        return False, "La contraseña debe incluir al menos una letra mayúscula."
    if not re.search(r"[a-z]", password):
        return False, "La contraseña debe incluir al menos una letra minúscula."
    if not re.search(r"[0-9]", password):
        return False, "La contraseña debe incluir al menos un número."
    if not re.search(r"[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]", password):
        return False, "La contraseña debe incluir al menos un carácter especial (ej. !@#$%^&*)."
    return True, "OK"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not plain_password or not hashed_password:
        return False
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(
    subject: str | Any,
    company_id: str,
    permissions: list[str] = [],
    expires_delta: Optional[timedelta] = None
) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "company_id": company_id,
        "permissions": permissions,
        "type": "access"
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_verification_token(user_id: str, email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=24)
    to_encode = {
        "exp": expire,
        "sub": user_id,
        "email": email,
        "type": "email_verification"
    }
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_password_reset_token(user_id: str, email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=30)
    to_encode = {
        "exp": expire,
        "sub": user_id,
        "email": email,
        "type": "password_reset"
    }
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_access_token(token: str) -> dict:
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
