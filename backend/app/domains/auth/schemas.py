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
    email: EmailStr

class DirectResetPasswordRequest(BaseModel):
    email: EmailStr
    new_password: str
    confirm_password: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class VerifyEmailRequest(BaseModel):
    token: str

class ResendVerificationRequest(BaseModel):
    email: EmailStr

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
    status: str = "active"
    email_verified: bool = True
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
    status: str
    email_verified: bool
    permissions: List[str]
    onboarding_completed: bool
    currency: str
    country: str
    timezone: str
    plan: str
    subscription_status: str

class UserSessionResponse(BaseModel):
    id: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    os_name: Optional[str] = None
    device_type: Optional[str] = None
    location: Optional[str] = None
    created_at: str
    last_activity: str
    is_active: bool

class CompanyUpdateSettings(BaseModel):
    name: Optional[str] = None
    tax_id: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    logo_url: Optional[str] = None
    currency: Optional[str] = None
    default_vat_rate: Optional[float] = None
    onboarding_completed: Optional[bool] = None
