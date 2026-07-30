from pydantic import BaseModel
from typing import List, Optional

class SaleItemCreate(BaseModel):
    product_id: str
    product_name: str
    quantity: float
    unit_price: float

class CheckoutRequest(BaseModel):
    items: List[SaleItemCreate]
    payment_method: str = "cash" # cash, card, bizum, transfer, voucher, mixed
    customer_id: Optional[str] = None
    cash_register_id: Optional[str] = None
    discount: float = 0.0
    change_given: float = 0.0
    notes: Optional[str] = None
    offline_sale_id: Optional[str] = None

class SaleItemResponse(BaseModel):
    id: str
    product_id: str
    product_name: str
    quantity: float
    unit_price: float
    total_price: float

class SaleResponse(BaseModel):
    id: str
    company_id: str
    invoice_number: str
    subtotal: float
    discount: float
    tax: float
    total: float
    payment_method: str
    status: str
    change_given: float = 0.0
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class SyncBatchRequest(BaseModel):
    sales: List[CheckoutRequest]
