-- Schema DDL PostgreSQL / SQLite Multi-Tenant para VENDIX POS SaaS Commercial (v5.0 Enterprise 2026)

CREATE TABLE IF NOT EXISTS plans (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    short_description TEXT,
    full_description TEXT,
    monthly_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    annual_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    trial_days INTEGER DEFAULT 14,
    color VARCHAR(20) DEFAULT '#6366f1',
    icon VARCHAR(50) DEFAULT 'Sparkles',
    sort_order INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    max_users INTEGER DEFAULT 1,
    max_products INTEGER DEFAULT 500,
    max_customers INTEGER DEFAULT 500,
    max_warehouses INTEGER DEFAULT 1,
    max_cash_registers INTEGER DEFAULT 1,
    has_printers BOOLEAN DEFAULT TRUE,
    storage_mb INTEGER DEFAULT 500,
    has_api BOOLEAN DEFAULT FALSE,
    has_ai BOOLEAN DEFAULT FALSE,
    has_ocr BOOLEAN DEFAULT FALSE,
    has_marketplace BOOLEAN DEFAULT FALSE,
    has_plugins BOOLEAN DEFAULT FALSE,
    has_priority_support BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS companies (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tax_id VARCHAR(50),
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    address TEXT,
    country VARCHAR(100) DEFAULT 'España',
    currency VARCHAR(10) DEFAULT 'EUR',
    timezone VARCHAR(50) DEFAULT 'Europe/Madrid',
    logo_url TEXT,
    default_vat_rate NUMERIC(5, 2) DEFAULT 21.00,
    equivalence_surcharge BOOLEAN DEFAULT FALSE,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    plan VARCHAR(50) DEFAULT 'Starter',
    license_status VARCHAR(20) DEFAULT 'trial', -- trial, active, suspended, cancelled, read_only
    trial_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    trial_end TIMESTAMP,
    max_users INTEGER DEFAULT 1,
    max_products INTEGER DEFAULT 500,
    max_customers INTEGER DEFAULT 500,
    max_warehouses INTEGER DEFAULT 1,
    max_cash_registers INTEGER DEFAULT 1,
    storage_mb_limit INTEGER DEFAULT 500,
    invoice_prefix VARCHAR(20) DEFAULT 'FAC-2026-',
    invoice_digits INTEGER DEFAULT 5,
    ticket_prefix VARCHAR(20) DEFAULT 'TK-',
    ticket_digits INTEGER DEFAULT 6,
    quote_prefix VARCHAR(20) DEFAULT 'PRE-',
    quote_digits INTEGER DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    company_id VARCHAR(36) NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'cashier', -- superadmin, admin, manager, cashier, employee
    is_active BOOLEAN DEFAULT TRUE,
    permissions JSON DEFAULT '[]',
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    email_verified BOOLEAN DEFAULT TRUE,
    verification_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_user_email_company UNIQUE (email, company_id)
);

CREATE TABLE IF NOT EXISTS warehouses (
    id VARCHAR(36) PRIMARY KEY,
    company_id VARCHAR(36) NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    is_main BOOLEAN DEFAULT FALSE,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(36) PRIMARY KEY,
    company_id VARCHAR(36) NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(36) PRIMARY KEY,
    company_id VARCHAR(36) NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    category_id VARCHAR(36) REFERENCES categories(id) ON DELETE SET NULL,
    warehouse_id VARCHAR(36) REFERENCES warehouses(id) ON DELETE SET NULL,
    barcode VARCHAR(100),
    sku VARCHAR(100),
    reference VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    supplier VARCHAR(255),
    brand VARCHAR(255),
    price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    vat_rate NUMERIC(5, 2) DEFAULT 21.00,
    surcharge_rate NUMERIC(5, 2) DEFAULT 0.00,
    margin NUMERIC(8, 2) DEFAULT 0.00,
    profit NUMERIC(12, 2) DEFAULT 0.00,
    stock NUMERIC(12, 3) NOT NULL DEFAULT 0.000,
    min_stock NUMERIC(12, 3) NOT NULL DEFAULT 0.000,
    max_stock NUMERIC(12, 3) NOT NULL DEFAULT 1000.000,
    unit VARCHAR(20) DEFAULT 'unit',
    location VARCHAR(100),
    lot_number VARCHAR(100),
    expiration_date VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    weighted_avg_cost NUMERIC(12, 2) DEFAULT 0.00,
    last_cost NUMERIC(12, 2) DEFAULT 0.00,
    last_purchase_at TIMESTAMP,
    last_sale_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_price_history (
    id VARCHAR(36) PRIMARY KEY,
    company_id VARCHAR(36) NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    product_id VARCHAR(36) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id VARCHAR(36) REFERENCES users(id),
    old_price NUMERIC(12, 2) NOT NULL,
    new_price NUMERIC(12, 2) NOT NULL,
    old_cost NUMERIC(12, 2) DEFAULT 0.00,
    new_cost NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(36) PRIMARY KEY,
    company_id VARCHAR(36) NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    tax_id VARCHAR(50),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    points INTEGER DEFAULT 0,
    last_purchase_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cash_registers (
    id VARCHAR(36) PRIMARY KEY,
    company_id VARCHAR(36) NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id),
    name VARCHAR(100) DEFAULT 'Caja Principal',
    status VARCHAR(20) NOT NULL DEFAULT 'closed',
    opening_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    closing_balance NUMERIC(12, 2),
    expected_balance NUMERIC(12, 2),
    difference NUMERIC(12, 2),
    opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP,
    closing_notes TEXT,
    signed_by VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS cash_movements (
    id VARCHAR(36) PRIMARY KEY,
    company_id VARCHAR(36) NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    cash_register_id VARCHAR(36) NOT NULL REFERENCES cash_registers(id) ON DELETE CASCADE,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id),
    type VARCHAR(20) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales (
    id VARCHAR(36) PRIMARY KEY,
    company_id VARCHAR(36) NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) NOT NULL,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id),
    customer_id VARCHAR(36) REFERENCES customers(id),
    cash_register_id VARCHAR(36) REFERENCES cash_registers(id),
    subtotal NUMERIC(12, 2) NOT NULL,
    discount NUMERIC(12, 2) DEFAULT 0.00,
    tax NUMERIC(12, 2) DEFAULT 0.00,
    total NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'cash',
    status VARCHAR(20) DEFAULT 'completed',
    notes TEXT,
    change_given NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_sale_invoice_company UNIQUE (invoice_number, company_id)
);

CREATE TABLE IF NOT EXISTS sale_items (
    id VARCHAR(36) PRIMARY KEY,
    sale_id VARCHAR(36) NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id VARCHAR(36) NOT NULL REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    quantity NUMERIC(12, 3) NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS inventory_movements (
    id VARCHAR(36) PRIMARY KEY,
    company_id VARCHAR(36) NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    product_id VARCHAR(36) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id VARCHAR(36) REFERENCES users(id),
    movement_type VARCHAR(50) NOT NULL,
    quantity NUMERIC(12, 3) NOT NULL,
    stock_before NUMERIC(12, 3) NOT NULL,
    stock_after NUMERIC(12, 3) NOT NULL,
    reason TEXT,
    notes TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS coupons (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    discount_percent NUMERIC(5, 2) DEFAULT 0.00,
    discount_amount NUMERIC(12, 2) DEFAULT 0.00,
    discount_type VARCHAR(20) DEFAULT 'percent', -- percent, fixed
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    max_uses INTEGER DEFAULT 100,
    used_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    applicable_plans JSON DEFAULT '[]',
    company_id VARCHAR(36) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS enterprise_backups (
    id VARCHAR(36) PRIMARY KEY,
    company_id VARCHAR(36) REFERENCES companies(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER DEFAULT 0,
    type VARCHAR(20) DEFAULT 'full', -- quick, full, snapshot
    storage_driver VARCHAR(50) DEFAULT 'local', -- local, S3, R2, B2, GCS, Azure, SFTP
    checksum VARCHAR(100),
    aes_encrypted BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_errors (
    id VARCHAR(36) PRIMARY KEY,
    company_id VARCHAR(36),
    user_id VARCHAR(36),
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    browser VARCHAR(100),
    os VARCHAR(100),
    status VARCHAR(20) DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity_logs (
    id VARCHAR(36) PRIMARY KEY,
    company_id VARCHAR(36) NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id VARCHAR(36) REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
