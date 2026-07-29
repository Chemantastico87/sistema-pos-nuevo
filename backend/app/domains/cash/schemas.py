from pydantic import BaseModel
from typing import Optional

class OpenCashRegisterRequest(BaseModel):
    opening_balance: float
    name: str = "Caja Principal"

class CloseCashRegisterRequest(BaseModel):
    closing_balance: float

class CashMovementCreate(BaseModel):
    cash_register_id: str
    type: str # deposit, withdrawal
    amount: float
    reason: str

class CashRegisterResponse(BaseModel):
    id: str
    company_id: str
    user_id: str
    name: str
    status: str
    opening_balance: float
    closing_balance: Optional[float]
    expected_balance: Optional[float]
    difference: Optional[float]

    class Config:
        from_attributes = True
