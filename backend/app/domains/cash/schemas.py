from pydantic import BaseModel
from typing import Optional, Dict

class OpenCashRegisterRequest(BaseModel):
    opening_balance: float
    name: str = "Caja Principal"

class CloseCashRegisterRequest(BaseModel):
    closing_balance: float
    closing_notes: Optional[str] = None
    signed_by: Optional[str] = None

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
    closing_balance: Optional[float] = None
    expected_balance: Optional[float] = None
    difference: Optional[float] = None
    opened_at: Optional[str] = None
    closed_at: Optional[str] = None
    closing_notes: Optional[str] = None
    signed_by: Optional[str] = None

    class Config:
        from_attributes = True

class CashClosureSummaryResponse(BaseModel):
    cash_register_id: str
    opened_at: str
    user_name: str
    opening_balance: float
    sales_cash: float
    sales_card: float
    sales_bizum: float
    sales_transfer: float
    sales_voucher: float
    sales_mixed: float
    total_sales: float
    manual_deposits: float
    manual_withdrawals: float
    returns: float
    discounts: float
    taxes: float
    change_given: float
    expected_balance: float
