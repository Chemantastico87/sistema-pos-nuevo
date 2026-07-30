from pydantic import BaseModel, EmailStr
from typing import List, Optional

class LoginRequest(BaseModel):
    email: str
    password: str

class CompanyRegisterRequest(BaseModel):
    company_name: str
    owner_name: str
    email: EmailStr
    password: str
    confirm_password: str
    country: str = "España"
    currency: str = "EUR"
    timezone: str = "Europe/Madrid"
    terms_accepted: bool

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class VerifyEmailRequest(BaseModel):
    token: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: str
    company_id: str
    full_name: str
    role: str
    permissions: List[str]
    onboarding_completed: bool
    currency: str
    plan: str
    subscription_status: str

class UserProfile(BaseModel):
    id: str
    company_id: str
    company_name: str
    email: str
    full_name: str
    role: str
    permissions: List[str]
    onboarding_completed: bool
    currency: str
    country: str
    timezone: str
    plan: str
    subscription_status: str

class CompanyUpdateSettings(BaseModel):
    name: Optional[str] = None
    tax_id: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    logo_url: Optional[str] = None
    currency: Optional[str] = None
    default_vat_rate: Optional[float] = None
    onboarding_completed: Optional[bool] = None
