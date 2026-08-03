from pydantic import BaseModel
from typing import Optional

class ProductCreate(BaseModel):
    name: str
    price: float
    cost_price: Optional[float] = None
    stock: float = 0.0
    min_stock: float = 0.0
    max_stock: float = 1000.0
    barcode: Optional[str] = None
    sku: Optional[str] = None
    reference: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    supplier: Optional[str] = None
    brand: Optional[str] = None
    vat_rate: float = 21.0
    margin: Optional[float] = None
    profit: Optional[float] = None
    unit: str = "unit"
    location: Optional[str] = None
    lot_number: Optional[str] = None
    expiration_date: Optional[str] = None
    category_id: Optional[str] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    cost_price: Optional[float] = None
    stock: Optional[float] = None
    min_stock: Optional[float] = None
    max_stock: Optional[float] = None
    barcode: Optional[str] = None
    sku: Optional[str] = None
    reference: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    supplier: Optional[str] = None
    brand: Optional[str] = None
    vat_rate: Optional[float] = None
    margin: Optional[float] = None
    profit: Optional[float] = None
    unit: Optional[str] = None
    location: Optional[str] = None
    lot_number: Optional[str] = None
    expiration_date: Optional[str] = None
    category_id: Optional[str] = None
    is_active: Optional[bool] = None

class ProductResponse(BaseModel):
    id: str
    company_id: str
    name: str
    price: float
    cost_price: Optional[float] = None
    vat_rate: float
    margin: Optional[float] = None
    profit: Optional[float] = None
    stock: float
    min_stock: float
    max_stock: float
    barcode: Optional[str] = None
    sku: Optional[str] = None
    reference: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    supplier: Optional[str] = None
    brand: Optional[str] = None
    unit: str = "unit"
    location: Optional[str] = None
    lot_number: Optional[str] = None
    expiration_date: Optional[str] = None
    category_id: Optional[str] = None
    is_active: bool = True

    class Config:
        from_attributes = True

class CategoryCreate(BaseModel):
    name: str

class CategoryResponse(BaseModel):
    id: str
    company_id: str
    name: str

class ProductPriceHistoryResponse(BaseModel):
    id: str
    company_id: str
    product_id: str
    user_id: Optional[str] = None
    old_price: float
    new_price: float
    old_cost: Optional[float] = None
    new_cost: Optional[float] = None
    reason: Optional[str] = None
    created_at: Optional[str] = None

    class Config:
        from_attributes = True

