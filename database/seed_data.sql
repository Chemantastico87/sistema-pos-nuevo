
    -- Company Demo
    INSERT INTO companies (id, name, tax_id, email, phone, address)
    VALUES ('comp_demo_12345', 'POS SaaS Demo Store', 'ABC-123456789', 'demo@possaas.com', '+52 555 123 4567', 'Av. Principal #100')
    ON CONFLICT (id) DO NOTHING;

    -- Admin User
    INSERT INTO users (id, company_id, email, hashed_password, full_name, role, permissions)
    VALUES ('usr_admin_99999', 'comp_demo_12345', 'admin@possaas.com', '$pbkdf2-sha256$29000$BIDQmhMCgFBK6Z2z1lrrvQ$JH5.dxBpU34lTQ8vqkhJWtkppWsI1slLyWYfCb6ixjI', 'Administrador Demo', 'admin', '["can_change_price", "can_delete_sale", "can_open_cash_register", "can_view_profit", "can_manage_inventory", "can_manage_users"]'::jsonb)
    ON CONFLICT (email, company_id) DO NOTHING;

    -- Categories
    INSERT INTO categories (id, company_id, name) VALUES
    ('cat_bebidas', 'comp_demo_12345', 'Bebidas'),
    ('cat_snacks', 'comp_demo_12345', 'Snacks & Abarrotes')
    ON CONFLICT (id) DO NOTHING;

    -- Products
    INSERT INTO products (id, company_id, category_id, barcode, sku, name, price, cost_price, stock, min_stock) VALUES
    ('prod_101', 'comp_demo_12345', 'cat_bebidas', '7501055300078', 'BEB-001', 'Refresco de Cola 600ml', 18.50, 12.00, 150.00, 20.00),
    ('prod_102', 'comp_demo_12345', 'cat_bebidas', '7501055300085', 'BEB-002', 'Agua Mineral 1L', 15.00, 8.50, 200.00, 30.00),
    ('prod_103', 'comp_demo_12345', 'cat_snacks', '7501000123456', 'SNK-001', 'Papas Fritas Sal 45g', 22.00, 14.00, 80.00, 15.00),
    ('prod_104', 'comp_demo_12345', 'cat_snacks', '7501000654321', 'SNK-002', 'Galletas de Chocolate 100g', 16.00, 9.00, 120.00, 25.00)
    ON CONFLICT (id) DO NOTHING;

    -- Demo Customer
    INSERT INTO customers (id, company_id, name, email, phone, points) VALUES
    ('cust_001', 'comp_demo_12345', 'Cliente Frecuente Demo', 'cliente@gmail.com', '555-987-6543', 150)
    ON CONFLICT (id) DO NOTHING;
    