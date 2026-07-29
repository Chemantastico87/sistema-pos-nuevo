"""
Script de inicialización de datos de prueba (Seed Data)
Empresa Demo, Usuario Admin y Productos de prueba con stock e índices.
"""
import asyncio
import json
import uuid
import sys
import os

# Permitir importaciones del backend
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.core.security import get_password_hash

DEMO_COMPANY_ID = "comp_demo_12345"
ADMIN_USER_ID = "usr_admin_99999"

def generate_seed_sql():
    admin_hash = get_password_hash("admin123")
    permissions = json.dumps([
        "can_change_price",
        "can_delete_sale",
        "can_open_cash_register",
        "can_view_profit",
        "can_manage_inventory",
        "can_manage_users"
    ])
    
    sql = f"""
    -- Company Demo
    INSERT INTO companies (id, name, tax_id, email, phone, address)
    VALUES ('{DEMO_COMPANY_ID}', 'POS SaaS Demo Store', 'ABC-123456789', 'demo@possaas.com', '+52 555 123 4567', 'Av. Principal #100')
    ON CONFLICT (id) DO NOTHING;

    -- Admin User
    INSERT INTO users (id, company_id, email, hashed_password, full_name, role, permissions)
    VALUES ('{ADMIN_USER_ID}', '{DEMO_COMPANY_ID}', 'admin@possaas.com', '{admin_hash}', 'Administrador Demo', 'admin', '{permissions}'::jsonb)
    ON CONFLICT (email, company_id) DO NOTHING;

    -- Categories
    INSERT INTO categories (id, company_id, name) VALUES
    ('cat_bebidas', '{DEMO_COMPANY_ID}', 'Bebidas'),
    ('cat_snacks', '{DEMO_COMPANY_ID}', 'Snacks & Abarrotes')
    ON CONFLICT (id) DO NOTHING;

    -- Products
    INSERT INTO products (id, company_id, category_id, barcode, sku, name, price, cost_price, stock, min_stock) VALUES
    ('prod_101', '{DEMO_COMPANY_ID}', 'cat_bebidas', '7501055300078', 'BEB-001', 'Refresco de Cola 600ml', 18.50, 12.00, 150.00, 20.00),
    ('prod_102', '{DEMO_COMPANY_ID}', 'cat_bebidas', '7501055300085', 'BEB-002', 'Agua Mineral 1L', 15.00, 8.50, 200.00, 30.00),
    ('prod_103', '{DEMO_COMPANY_ID}', 'cat_snacks', '7501000123456', 'SNK-001', 'Papas Fritas Sal 45g', 22.00, 14.00, 80.00, 15.00),
    ('prod_104', '{DEMO_COMPANY_ID}', 'cat_snacks', '7501000654321', 'SNK-002', 'Galletas de Chocolate 100g', 16.00, 9.00, 120.00, 25.00)
    ON CONFLICT (id) DO NOTHING;

    -- Demo Customer
    INSERT INTO customers (id, company_id, name, email, phone, points) VALUES
    ('cust_001', '{DEMO_COMPANY_ID}', 'Cliente Frecuente Demo', 'cliente@gmail.com', '555-987-6543', 150)
    ON CONFLICT (id) DO NOTHING;
    """
    
    with open(os.path.join(os.path.dirname(__file__), "..", "database", "seed_data.sql"), "w", encoding="utf-8") as f:
        f.write(sql)
    print("[OK] Archivo seed_data.sql generado exitosamente.")

if __name__ == "__main__":
    generate_seed_sql()
