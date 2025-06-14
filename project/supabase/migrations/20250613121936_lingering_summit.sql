/*
  # E-commerce Variant System Implementation

  1. New Tables
    - `product_variants`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key to products.id)
      - `name` (text, variant name like "Talla M", "Color Rojo")
      - `sku` (text, unique SKU for this variant)
      - `price_modifier` (decimal, price difference from base price)
      - `stock_quantity` (integer, stock for this variant)
      - `is_available` (boolean, availability toggle)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Changes to Products Table
    - Add `main_sku` (text, unique, required)
    - Add `base_price` (decimal, required)
    - Add `stock_quantity` (integer, required)
    - Rename `price` to `display_price` (for backward compatibility)

  3. Security
    - Enable RLS on `product_variants` table
    - Add policies for authenticated users to manage their product variants
    - Add policy for public read access
*/

-- Add new columns to products table
DO $$
BEGIN
  -- Add main_sku column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'main_sku'
  ) THEN
    ALTER TABLE products ADD COLUMN main_sku text;
  END IF;

  -- Add base_price column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'base_price'
  ) THEN
    ALTER TABLE products ADD COLUMN base_price decimal(10,2);
  END IF;

  -- Add stock_quantity column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'stock_quantity'
  ) THEN
    ALTER TABLE products ADD COLUMN stock_quantity integer DEFAULT 0;
  END IF;

  -- Rename price to display_price for backward compatibility
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'price'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'display_price'
  ) THEN
    ALTER TABLE products RENAME COLUMN price TO display_price;
  END IF;
END $$;

-- Create product_variants table
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  sku text UNIQUE NOT NULL,
  price_modifier decimal(10,2) DEFAULT 0,
  stock_quantity integer DEFAULT 0,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Create policies for product_variants
CREATE POLICY "Users can view own product variants" ON product_variants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_variants.product_id 
      AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own product variants" ON product_variants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_variants.product_id 
      AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own product variants" ON product_variants
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_variants.product_id 
      AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own product variants" ON product_variants
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_variants.product_id 
      AND products.user_id = auth.uid()
    )
  );

-- Allow public read access for public catalogs
CREATE POLICY "Public can view product variants" ON product_variants
  FOR SELECT USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_products_main_sku ON products(main_sku);

-- Add unique constraint for main_sku
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'products_main_sku_key' 
    AND table_name = 'products'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT products_main_sku_key UNIQUE (main_sku);
  END IF;
END $$;

-- Migrate existing data
UPDATE products 
SET 
  main_sku = COALESCE(main_sku, 'SKU-' || id),
  base_price = COALESCE(base_price, 0),
  stock_quantity = COALESCE(stock_quantity, 0)
WHERE main_sku IS NULL OR base_price IS NULL;

-- Make required columns NOT NULL after migration
ALTER TABLE products ALTER COLUMN main_sku SET NOT NULL;
ALTER TABLE products ALTER COLUMN base_price SET NOT NULL;
ALTER TABLE products ALTER COLUMN stock_quantity SET NOT NULL;