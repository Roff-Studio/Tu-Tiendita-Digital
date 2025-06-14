/*
  # Add Product Images Support

  1. New Tables
    - `product_images`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key to products.id)
      - `image_url` (text, not null)
      - `position` (integer, for ordering)
      - `created_at` (timestamp)

  2. Changes
    - Remove `image_url` column from products table (will be handled by product_images table)

  3. Security
    - Enable RLS on `product_images` table
    - Add policies for authenticated users to manage their product images
    - Add policy for public read access
*/

-- Create product_images table
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Create policies for product_images
CREATE POLICY "Users can view own product images" ON product_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_images.product_id 
      AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own product images" ON product_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_images.product_id 
      AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own product images" ON product_images
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_images.product_id 
      AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own product images" ON product_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_images.product_id 
      AND products.user_id = auth.uid()
    )
  );

-- Allow public read access for public catalogs
CREATE POLICY "Public can view product images" ON product_images
  FOR SELECT USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_position ON product_images(product_id, position);

-- Remove image_url column from products table (if it exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE products DROP COLUMN image_url;
  END IF;
END $$;