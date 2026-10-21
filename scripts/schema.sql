-- FENDI Plastic Industry - PostgreSQL Database Schema
-- Idempotent and repeatable schema definition

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    key VARCHAR(50) PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    source_hash VARCHAR(67) NULL
);

-- Ensure source_hash exists and can hold the v2: prefix plus a 64-character SHA-256 digest.
ALTER TABLE categories ADD COLUMN IF NOT EXISTS source_hash VARCHAR(67) NULL;
ALTER TABLE categories ALTER COLUMN source_hash TYPE VARCHAR(67);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(100) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    category_key VARCHAR(50) NOT NULL REFERENCES categories(key) ON UPDATE CASCADE ON DELETE RESTRICT,
    image VARCHAR(255) NOT NULL,
    video VARCHAR(500) NULL,
    short_desc TEXT NOT NULL,
    features TEXT[] NOT NULL DEFAULT '{}',
    tag VARCHAR(100) NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    source_hash VARCHAR(67) NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure source_hash exists and can hold the v2: prefix plus a 64-character SHA-256 digest.
ALTER TABLE products ADD COLUMN IF NOT EXISTS source_hash VARCHAR(67) NULL;
ALTER TABLE products ALTER COLUMN source_hash TYPE VARCHAR(67);

-- Ensure optional video column exists for demonstration video support
ALTER TABLE products ADD COLUMN IF NOT EXISTS video VARCHAR(500) NULL;

-- 3. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_key);
CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_sort_order ON products(sort_order);

-- 4. Trigger for Auto-Updating updated_at Timestamp
CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_products_updated_at ON products;
CREATE TRIGGER trigger_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();
