-- FENDI catalog schema for MariaDB 10.5+ / MySQL-compatible cPanel hosting.
-- Run this from the cPanel database tool or with scripts/init-mariadb.mjs.

CREATE TABLE IF NOT EXISTS categories (
  `key` VARCHAR(50) NOT NULL,
  label VARCHAR(100) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  source_hash VARCHAR(67) NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  category_key VARCHAR(50) NOT NULL,
  image VARCHAR(255) NOT NULL,
  video VARCHAR(500) NULL,
  short_desc TEXT NOT NULL,
  features LONGTEXT NOT NULL,
  tag VARCHAR(100) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  source_hash VARCHAR(67) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_products_code (code),
  KEY idx_products_category (category_key),
  KEY idx_products_is_active (is_active),
  KEY idx_products_sort_order (sort_order),
  CONSTRAINT fk_products_category FOREIGN KEY (category_key)
    REFERENCES categories (`key`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
