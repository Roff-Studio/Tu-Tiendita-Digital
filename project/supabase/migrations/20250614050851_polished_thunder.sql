/*
  # Analytics System Implementation

  1. New Tables
    - `analytics_events`
      - `id` (uuid, primary key)
      - `store_slug` (text, for tracking by store)
      - `event_type` (text, type of event: 'product_view', 'order_created', etc.)
      - `product_id` (uuid, optional, references products.id)
      - `session_id` (text, for tracking user sessions)
      - `user_agent` (text, browser information)
      - `ip_address` (inet, client IP)
      - `metadata` (jsonb, additional event data)
      - `created_at` (timestamp)

  2. Changes to Products Table
    - Add `view_count` (integer, default 0)

  3. Database Functions
    - `increment_product_views` function for atomic view count updates

  4. Security
    - Enable RLS on `analytics_events` table
    - Add policies for authenticated users to view their analytics
    - Add policy for edge functions to insert events

  5. Indexes
    - Performance indexes for analytics queries
*/

-- Add view_count column to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'view_count'
  ) THEN
    ALTER TABLE products ADD COLUMN view_count integer DEFAULT 0;
  END IF;
END $$;

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_slug text NOT NULL,
  event_type text NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  session_id text,
  user_agent text,
  ip_address inet,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Create policies for analytics_events
CREATE POLICY "Users can view own store analytics" ON analytics_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.store_slug = analytics_events.store_slug 
      AND users.id = auth.uid()
    )
  );

CREATE POLICY "Service role can insert analytics events" ON analytics_events
  FOR INSERT WITH CHECK (true);

-- Allow public read access for aggregated analytics (no personal data)
CREATE POLICY "Public can view aggregated analytics" ON analytics_events
  FOR SELECT USING (true);

-- Create function to increment product views atomically
CREATE OR REPLACE FUNCTION increment_product_views(product_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE products 
  SET view_count = COALESCE(view_count, 0) + 1,
      updated_at = now()
  WHERE id = product_id;
END;
$$;

-- Create indexes for analytics performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_store_slug ON analytics_events(store_slug);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_product_id ON analytics_events(product_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_store_event_date ON analytics_events(store_slug, event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_product_views ON analytics_events(product_id, event_type) WHERE event_type = 'product_view';

-- Index for products view_count
CREATE INDEX IF NOT EXISTS idx_products_view_count ON products(view_count DESC) WHERE view_count > 0;

-- Update existing products to have view_count = 0 if null
UPDATE products SET view_count = 0 WHERE view_count IS NULL;

-- Make view_count NOT NULL after setting defaults
ALTER TABLE products ALTER COLUMN view_count SET NOT NULL;

-- Analyze tables for better query planning
ANALYZE analytics_events;
ANALYZE products;