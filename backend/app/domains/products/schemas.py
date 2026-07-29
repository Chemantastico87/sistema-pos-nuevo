from pydantic import BaseModel
from typing import Optional

class ProductCreate(BaseModel):
    name: str
    price: float
    cost_price: float = 0.0
    stock: float = 0.0
    min_stock: float = 0.0
    barcode: Optional[str] = None
    sku: Optional[str] = None
    category_id: Optional[str] = None
    unit: str = "unit"

class ProductResponse(BaseModel):
    id: str
    company_id: str
    name: str
    price: float
    cost_price: float
    stock: float
    min_stock: float
    barcode: Optional[str]
    sku: Optional[str]
    category_id: Optional[str]
    unit: str
    is_active: bool

    class Config:
        from_attributes = True
