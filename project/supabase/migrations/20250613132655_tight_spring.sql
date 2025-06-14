/*
  # Performance Optimization Indexes

  1. New Indexes
    - Products table performance indexes
    - Product images ordering index
    - Product variants lookup index
    - Users store slug lookup index

  2. Query Optimization
    - Composite indexes for common query patterns
    - Partial indexes for filtered queries
    - Covering indexes for select operations

  3. Performance Improvements
    - Faster product listing queries
    - Optimized image ordering
    - Improved variant lookups
    - Enhanced public catalog performance
*/

-- Products table performance indexes
CREATE INDEX IF NOT EXISTS idx_products_user_id_available ON products(user_id, is_available);
CREATE INDEX IF NOT EXISTS idx_products_user_id_position ON products(user_id, position NULLS LAST, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_user_id_category ON products(user_id, category) WHERE category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_updated_at ON products(updated_at DESC);

-- Product images performance indexes
CREATE INDEX IF NOT EXISTS idx_product_images_product_position ON product_images(product_id, position);
CREATE INDEX IF NOT EXISTS idx_product_images_created_at ON product_images(created_at DESC);

-- Product variants performance indexes
CREATE INDEX IF NOT EXISTS idx_product_variants_product_available ON product_variants(product_id, is_available);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku_unique ON product_variants(sku) WHERE sku IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_product_variants_created_at ON product_variants(created_at);

-- Users table performance indexes
CREATE INDEX IF NOT EXISTS idx_users_store_slug_unique ON users(store_slug) WHERE store_slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_onboarding ON users(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_updated_at ON users(updated_at DESC);

-- Composite indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_products_public_catalog ON products(user_id, is_available, category, position NULLS LAST) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_products_dashboard_listing ON products(user_id, position NULLS LAST, created_at DESC);

-- Partial indexes for filtered queries
CREATE INDEX IF NOT EXISTS idx_products_available_only ON products(user_id, created_at DESC) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_product_variants_available_only ON product_variants(product_id, created_at) WHERE is_available = true;

-- Text search indexes for future search functionality
CREATE INDEX IF NOT EXISTS idx_products_name_search ON products USING gin(to_tsvector('spanish', name));
CREATE INDEX IF NOT EXISTS idx_products_description_search ON products USING gin(to_tsvector('spanish', description)) WHERE description IS NOT NULL;

-- Analyze tables for better query planning
ANALYZE users;
ANALYZE products;
ANALYZE product_images;
ANALYZE product_variants;