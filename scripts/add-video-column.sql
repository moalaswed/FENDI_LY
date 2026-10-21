-- MariaDB compatibility migration for databases created before video support.
-- Fresh installations already include this column in scripts/schema.sql.
ALTER TABLE products ADD COLUMN IF NOT EXISTS video VARCHAR(500) NULL;
