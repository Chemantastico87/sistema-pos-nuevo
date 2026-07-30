import uuid
import csv
import io
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.core.tenant import TenantContext, get_current_tenant
from app.domains.products.models import ProductModel
from app.domains.customers.models import CustomerModel
from app.domains.pos.models import SaleModel
from app.domains.cash.models import CashRegisterModel

router = APIRouter(prefix="/import-export", tags=["Import / Export"])

@router.post("/import/products")
async def import_products_csv(
    file: UploadFile = File(...),
    tenant: TenantContext = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    if not file.filename.endswith(('.csv', '.txt')):
        raise HTTPException(status_code=400, detail="Por favor suba un archivo en formato CSV.")

    content = await file.read()
    text = content.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(text))

    imported_count = 0
    for row in reader:
        name = row.get("Nombre") or row.get("name")
        if not name:
            continue
        price = float(row.get("Precio") or row.get("price") or 0.0)
        cost = float(row.get("Costo") or row.get("cost_price") or 0.0)
        stock = float(row.get("Stock") or row.get("stock") or 0.0)
        barcode = row.get("CodigoBarras") or row.get("barcode") or None
        sku = row.get("SKU") or row.get("sku") or None

        profit = price - cost
        margin = ((price - cost) / price * 100) if price > 0 else 0.0

        prod = ProductModel(
            id=f"prod_{uuid.uuid4().hex[:12]}",
            company_id=tenant.company_id,
            name=name,
            price=price,
            cost_price=cost,
            profit=profit,
            margin=margin,
            stock=stock,
            barcode=barcode,
            sku=sku
        )
        db.add(prod)
        imported_count += 1

    await db.commit()
    return {"message": f"Se importaron {imported_count} productos exitosamente."}

@router.get("/export/{entity}")
async def export_entity_csv(
    entity: str, # products, customers, sales, cash
    tenant: TenantContext = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    output = io.StringIO()
    writer = csv.writer(output)

    if entity == "products":
        res = await db.execute(select(ProductModel).where(ProductModel.company_id == tenant.company_id))
        items = res.scalars().all()
        writer.writerow(["ID", "Nombre", "CodigoBarras", "SKU", "PrecioVenta", "PrecioCosto", "MargenPorcentaje", "Beneficio", "StockActual", "StockMinimo", "Ubicacion", "Lote", "FechaCaducidad"])
        for p in items:
            writer.writerow([p.id, p.name, p.barcode or "", p.sku or "", p.price, p.cost_price, p.margin, p.profit, p.stock, p.min_stock, p.location or "", p.lot_number or "", p.expiration_date or ""])

    elif entity == "customers":
        res = await db.execute(select(CustomerModel).where(CustomerModel.company_id == tenant.company_id))
        items = res.scalars().all()
        writer.writerow(["ID", "Nombre", "TaxID", "Email", "Telefono", "Puntos"])
        for c in items:
            writer.writerow([c.id, c.name, c.tax_id or "", c.email or "", c.phone or "", c.points])

    elif entity == "sales":
        res = await db.execute(select(SaleModel).where(SaleModel.company_id == tenant.company_id))
        items = res.scalars().all()
        writer.writerow(["ID", "Factura", "Fecha", "MetodoPago", "Subtotal", "Descuento", "Impuestos", "Total", "Estado"])
        for s in items:
            writer.writerow([s.id, s.invoice_number, str(s.created_at), s.payment_method, s.subtotal, s.discount, s.tax, s.total, s.status])

    else:
        raise HTTPException(status_code=400, detail="Entidad de exportación no soportada")

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=export_{entity}_{tenant.company_id[:8]}.csv"}
    )
