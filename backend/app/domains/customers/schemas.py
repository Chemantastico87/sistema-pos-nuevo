from pydantic import BaseModel
from typing import Optional

class CustomerCreate(BaseModel):
    name: str
    tax_id: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

class CustomerResponse(BaseModel):
    id: str
    company_id: str
    name: str
    tax_id: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    points: int

    class Config:
        from_attributes = True
