-- FENDI Plastic Industry - Idempotent Database Migration
-- Feature: Optional Product Demonstration Video Support
-- Adds a nullable 'video' column to the 'products' table if it does not already exist.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'video'
    ) THEN
        ALTER TABLE products ADD COLUMN video VARCHAR(500) NULL;
        COMMENT ON COLUMN products.video IS 'Optional URL or relative public path to product video (MP4/WebM/YouTube/Vimeo)';
        RAISE NOTICE 'Column "video" successfully added to "products" table.';
    ELSE
        RAISE NOTICE 'Column "video" already exists on "products" table.';
    END IF;
END $$;
