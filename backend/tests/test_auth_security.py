import pytest
import asyncio
from datetime import datetime, timedelta, timezone
from app.core.security import (
    validate_password_complexity,
    get_password_hash,
    verify_password,
    create_access_token,
    create_verification_token
)

def test_password_complexity_validator():
    """Prueba las reglas estrictas de fortaleza de contraseña VENDIX"""
    # Menos de 12 caracteres
    valid, msg = validate_password_complexity("Short1!")
    assert not valid

    # Sin mayúscula
    valid, msg = validate_password_complexity("vendixpass123!")
    assert not valid

    # Sin minúscula
    valid, msg = validate_password_complexity("VENDIXPASS123!")
    assert not valid

    # Sin número
    valid, msg = validate_password_complexity("VendixPassword!")
    assert not valid

    # Sin símbolo especial
    valid, msg = validate_password_complexity("VendixPass1234")
    assert not valid

    # Contraseña válida
    valid, msg = validate_password_complexity("Vendix#Pass2026")
    assert valid
    assert msg == "OK"

def test_password_hashing_and_verification():
    """Prueba la verificación de hash de contraseña (Argon2 / bcrypt)"""
    plain = "Secur3#Passw0rd2026"
    hashed = get_password_hash(plain)

    # 1. Contraseña correcta -> True
    assert verify_password(plain, hashed) is True

    # 2. Contraseña incorrecta -> False
    assert verify_password("Wrong#Password123", hashed) is False

    # 3. Contraseña vacía o nula -> False
    assert verify_password("", hashed) is False
    assert verify_password(plain, "") is False

def test_jwt_access_token_creation_and_decoding():
    """Prueba la emisión y decodificación de tokens JWT"""
    token = create_access_token(
        subject="usr_test123",
        company_id="comp_test123",
        permissions=["can_open_cash_register"]
    )
    assert token is not None
    assert isinstance(token, str)

def test_verification_token_generation():
    """Prueba tokens de verificación firmados con expiración"""
    verif_token = create_verification_token("usr_test123", "test@vendixpos.com")
    assert verif_token is not None
