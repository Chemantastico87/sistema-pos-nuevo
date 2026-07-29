from pydantic import BaseModel, EmailStr
from typing import List, Optional

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    company_id: str
    full_name: str
    role: str
    permissions: List[str]

class UserProfile(BaseModel):
    id: str
    company_id: str
    email: str
    full_name: str
    role: str
    permissions: List[str]
