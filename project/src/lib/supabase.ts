import { createClient } from '@supabase/supabase-js'
import { TIMEOUTS, ERROR_MESSAGES } from '../utils/constants';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔍 DEBUGGING SUPABASE CONFIG:');
console.log('Environment variables:', {
  VITE_SUPABASE_URL: supabaseUrl,
  VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? 'Present' : 'Missing',
  NODE_ENV: import.meta.env.NODE_ENV,
  MODE: import.meta.env.MODE
});

// Use the new credentials
const finalUrl = 'https://lwflptiltwnxjvfvtyrx.supabase.co'
const finalKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3ZmxwdGlsdHdueGp2ZnZ0eXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4MDQ2MDQsImV4cCI6MjA2NTM4MDYwNH0.X_2LK7DBqAePQ5d-1SQ0fijAedMgPlTjoN1zekn5fmg'

console.log('🔧 USING SUPABASE CONFIG:', {
  url: finalUrl,
  keyLength: finalKey.length,
  keyPrefix: finalKey.substring(0, 20) + '...'
});

// FIXED: Enhanced Supabase client configuration
export const supabase = createClient(finalUrl, finalKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'catalog-management-system'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// FIXED: Enhanced connection test with proper timeout and error handling
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('🧪 Testing Supabase connection...');
    
    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, TIMEOUTS.DEFAULT_REQUEST);
    });

    // Test connection with a simple query
    const connectionPromise = supabase.auth.getSession();
    
    const { error } = await Promise.race([connectionPromise, timeoutPromise]);
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error: any) {
    console.error('💥 Supabase connection error:', error);
    return false;
  }
};

// FIXED: Enhanced type definitions with proper exports
export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  position: number;
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  priceModifier: number;
  stockQuantity: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  mainSku: string;
  basePrice: number;
  stockQuantity: number;
  isAvailable: boolean;
  category?: string | null;
  position?: number | null;
  createdAt: string;
  updatedAt: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
  // Legacy support for backward compatibility
  displayPrice?: string | null;
  price?: string | null;
  imageUrl?: string | null;
}

// FIXED: Enhanced database types with comprehensive schema
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          store_slug: string | null
          store_name: string | null
          whatsapp_number: string | null
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          store_slug?: string | null
          store_name?: string | null
          whatsapp_number?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          store_slug?: string | null
          store_name?: string | null
          whatsapp_number?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          main_sku: string
          base_price: number
          stock_quantity: number
          is_available: boolean
          category: string | null
          position: number | null
          display_price: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          main_sku: string
          base_price: number
          stock_quantity?: number
          is_available?: boolean
          category?: string | null
          position?: number | null
          display_price?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          main_sku?: string
          base_price?: number
          stock_quantity?: number
          is_available?: boolean
          category?: string | null
          position?: number | null
          display_price?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          image_url: string
          position: number
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          image_url: string
          position?: number
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          image_url?: string
          position?: number
          created_at?: string
        }
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          name: string
          sku: string
          price_modifier: number
          stock_quantity: number
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          name: string
          sku: string
          price_modifier?: number
          stock_quantity?: number
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          name?: string
          sku?: string
          price_modifier?: number
          stock_quantity?: number
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// FIXED: Enhanced query with performance optimizations
export const fetchProductsWithImages = async (userId: string): Promise<Product[]> => {
  try {
    console.log('🚀 OPTIMIZED: Fetching products with images and variants for user:', userId);
    
    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Query timeout'));
      }, TIMEOUTS.DEFAULT_REQUEST);
    });

    // OPTIMIZED: Single query with proper ordering and indexing
    const queryPromise = supabase
      .from('products')
      .select(`
        *,
        product_images (
          id,
          image_url,
          position,
          created_at
        ),
        product_variants (
          id,
          name,
          sku,
          price_modifier,
          stock_quantity,
          is_available,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', userId)
      .order('position', { ascending: true, nullsLast: true })
      .order('created_at', { ascending: false });

    const { data: productsWithRelations, error } = await Promise.race([queryPromise, timeoutPromise]);

    if (error) {
      console.error('❌ Error in optimized query:', error);
      throw new Error(error.message || ERROR_MESSAGES.SERVER_ERROR);
    }

    console.log('✅ OPTIMIZED: Query completed, processing', productsWithRelations?.length || 0, 'products');

    // FIXED: Enhanced data transformation with proper error handling
    const products: Product[] = (productsWithRelations || []).map(product => {
      try {
        // Sort images by position
        const sortedImages = (product.product_images || [])
          .sort((a, b) => a.position - b.position)
          .map(image => ({
            id: image.id,
            productId: product.id,
            imageUrl: image.image_url,
            position: image.position,
            createdAt: image.created_at
          }));

        // Sort variants by creation date
        const sortedVariants = (product.product_variants || [])
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          .map(variant => ({
            id: variant.id,
            productId: product.id,
            name: variant.name,
            sku: variant.sku,
            priceModifier: variant.price_modifier,
            stockQuantity: variant.stock_quantity,
            isAvailable: variant.is_available,
            createdAt: variant.created_at,
            updatedAt: variant.updated_at
          }));

        return {
          id: product.id,
          name: product.name,
          description: product.description,
          mainSku: product.main_sku,
          basePrice: product.base_price,
          stockQuantity: product.stock_quantity,
          isAvailable: product.is_available,
          category: product.category,
          position: product.position,
          createdAt: product.created_at,
          updatedAt: product.updated_at,
          images: sortedImages,
          variants: sortedVariants,
          // Legacy support
          displayPrice: product.display_price,
          price: product.display_price,
          imageUrl: sortedImages[0]?.imageUrl || null
        };
      } catch (transformError) {
        console.error('Error transforming product data:', transformError, product);
        throw new Error('Error al procesar datos del producto');
      }
    });

    console.log('✅ PERFORMANCE: Single request returned', products.length, 'products with images and variants');
    return products;
  } catch (error: any) {
    console.error('💥 Error in fetchProductsWithImages:', error);
    throw new Error(error.message || ERROR_MESSAGES.SERVER_ERROR);
  }
};

// FIXED: Enhanced single product fetch with timeout and error handling
export const fetchProductWithImages = async (productId: string): Promise<Product | null> => {
  try {
    console.log('🚀 OPTIMIZED: Fetching single product with images and variants:', productId);
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Query timeout'));
      }, TIMEOUTS.DEFAULT_REQUEST);
    });

    const queryPromise = supabase
      .from('products')
      .select(`
        *,
        product_images (
          id,
          image_url,
          position,
          created_at
        ),
        product_variants (
          id,
          name,
          sku,
          price_modifier,
          stock_quantity,
          is_available,
          created_at,
          updated_at
        )
      `)
      .eq('id', productId)
      .single();

    const { data: productWithRelations, error } = await Promise.race([queryPromise, timeoutPromise]);

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Product not found
      }
      console.error('❌ Error fetching product:', error);
      throw new Error(error.message || ERROR_MESSAGES.SERVER_ERROR);
    }

    if (!productWithRelations) {
      return null;
    }

    // Transform data with error handling
    try {
      const sortedImages = (productWithRelations.product_images || [])
        .sort((a, b) => a.position - b.position)
        .map(image => ({
          id: image.id,
          productId: productWithRelations.id,
          imageUrl: image.image_url,
          position: image.position,
          createdAt: image.created_at
        }));

      const sortedVariants = (productWithRelations.product_variants || [])
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map(variant => ({
          id: variant.id,
          productId: productWithRelations.id,
          name: variant.name,
          sku: variant.sku,
          priceModifier: variant.price_modifier,
          stockQuantity: variant.stock_quantity,
          isAvailable: variant.is_available,
          createdAt: variant.created_at,
          updatedAt: variant.updated_at
        }));

      const product: Product = {
        id: productWithRelations.id,
        name: productWithRelations.name,
        description: productWithRelations.description,
        mainSku: productWithRelations.main_sku,
        basePrice: productWithRelations.base_price,
        stockQuantity: productWithRelations.stock_quantity,
        isAvailable: productWithRelations.is_available,
        category: productWithRelations.category,
        position: productWithRelations.position,
        createdAt: productWithRelations.created_at,
        updatedAt: productWithRelations.updated_at,
        images: sortedImages,
        variants: sortedVariants,
        // Legacy support
        displayPrice: productWithRelations.display_price,
        price: productWithRelations.display_price,
        imageUrl: sortedImages[0]?.imageUrl || null
      };

      console.log('✅ OPTIMIZED: Single product fetch completed with', sortedImages.length, 'images and', sortedVariants.length, 'variants');
      return product;
    } catch (transformError) {
      console.error('Error transforming single product data:', transformError);
      throw new Error('Error al procesar datos del producto');
    }
  } catch (error: any) {
    console.error('💥 Error in fetchProductWithImages:', error);
    throw new Error(error.message || ERROR_MESSAGES.SERVER_ERROR);
  }
};

// FIXED: Enhanced public catalog fetch with comprehensive error handling
export const fetchPublicCatalogData = async (storeSlug: string) => {
  try {
    console.log('🚀 OPTIMIZED: Fetching public catalog data for:', storeSlug);
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Query timeout'));
      }, TIMEOUTS.DEFAULT_REQUEST);
    });

    // OPTIMIZED: Single query with proper indexing
    const queryPromise = supabase
      .from('users')
      .select(`
        id,
        store_name,
        whatsapp_number,
        products!inner (
          *,
          product_images (
            id,
            image_url,
            position,
            created_at
          ),
          product_variants (
            id,
            name,
            sku,
            price_modifier,
            stock_quantity,
            is_available,
            created_at,
            updated_at
          )
        )
      `)
      .eq('store_slug', storeSlug)
      .eq('products.is_available', true)
      .single();

    const { data: storeData, error: storeError } = await Promise.race([queryPromise, timeoutPromise]);

    if (storeError || !storeData) {
      console.error('❌ Store not found:', storeError);
      throw new Error('Tienda no encontrada');
    }

    // FIXED: Enhanced data transformation with error handling
    const products: Product[] = (storeData.products || []).map(product => {
      try {
        const sortedImages = (product.product_images || [])
          .sort((a, b) => a.position - b.position)
          .map(image => ({
            id: image.id,
            productId: product.id,
            imageUrl: image.image_url,
            position: image.position,
            createdAt: image.created_at
          }));

        const sortedVariants = (product.product_variants || [])
          .filter(variant => variant.is_available && variant.stock_quantity > 0)
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          .map(variant => ({
            id: variant.id,
            productId: product.id,
            name: variant.name,
            sku: variant.sku,
            priceModifier: variant.price_modifier,
            stockQuantity: variant.stock_quantity,
            isAvailable: variant.is_available,
            createdAt: variant.created_at,
            updatedAt: variant.updated_at
          }));

        return {
          id: product.id,
          name: product.name,
          description: product.description,
          mainSku: product.main_sku,
          basePrice: product.base_price,
          stockQuantity: product.stock_quantity,
          isAvailable: product.is_available,
          category: product.category,
          position: product.position,
          createdAt: product.created_at,
          updatedAt: product.updated_at,
          images: sortedImages,
          variants: sortedVariants,
          // Legacy support
          displayPrice: product.display_price,
          price: product.display_price,
          imageUrl: sortedImages[0]?.imageUrl || null
        };
      } catch (transformError) {
        console.error('Error transforming public catalog product:', transformError, product);
        // Return a minimal product object to prevent complete failure
        return {
          id: product.id,
          name: product.name || 'Producto sin nombre',
          description: product.description,
          mainSku: product.main_sku || '',
          basePrice: product.base_price || 0,
          stockQuantity: product.stock_quantity || 0,
          isAvailable: product.is_available,
          category: product.category,
          position: product.position,
          createdAt: product.created_at,
          updatedAt: product.updated_at,
          images: [],
          variants: [],
          displayPrice: product.display_price,
          price: product.display_price,
          imageUrl: null
        };
      }
    });

    // Sort products by position and creation date
    products.sort((a, b) => {
      if (a.position !== null && b.position !== null) {
        return a.position - b.position;
      }
      if (a.position !== null) return -1;
      if (b.position !== null) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const result = {
      storeOwner: {
        storeName: storeData.store_name || 'Mi Tienda',
        whatsappNumber: storeData.whatsapp_number || ''
      },
      products
    };

    console.log('✅ OPTIMIZED: Public catalog fetch completed with', products.length, 'products');
    return result;
  } catch (error: any) {
    console.error('💥 Error in fetchPublicCatalogData:', error);
    throw new Error(error.message || ERROR_MESSAGES.SERVER_ERROR);
  }
};

// FIXED: Enhanced SKU validation with proper error handling and timeout
export const validateSKU = async (sku: string, excludeProductId?: string): Promise<boolean> => {
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('SKU validation timeout'));
      }, TIMEOUTS.DEFAULT_REQUEST);
    });

    // Check main product SKUs
    let productQuery = supabase
      .from('products')
      .select('id')
      .eq('main_sku', sku);

    if (excludeProductId) {
      productQuery = productQuery.neq('id', excludeProductId);
    }

    const productPromise = productQuery.maybeSingle();

    // Check variant SKUs
    const variantPromise = supabase
      .from('product_variants')
      .select('id')
      .eq('sku', sku)
      .maybeSingle();

    const [{ data: productData, error: productError }, { data: variantData, error: variantError }] = await Promise.race([
      Promise.all([productPromise, variantPromise]),
      timeoutPromise
    ]);

    if (productError && productError.code !== 'PGRST116') {
      console.error('Error checking product SKU:', productError);
      return false; // Assume invalid on error to be safe
    }

    if (variantError && variantError.code !== 'PGRST116') {
      console.error('Error checking variant SKU:', variantError);
      return false; // Assume invalid on error to be safe
    }

    return !productData && !variantData;
  } catch (error: any) {
    console.error('Error validating SKU:', error);
    return false; // Assume invalid on error to be safe
  }
};

// FIXED: Enhanced unique SKU generation with better error handling
export const generateUniqueSKU = async (baseName: string): Promise<string> => {
  try {
    const baseSku = baseName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 10);
    
    if (!baseSku) {
      // Fallback if no valid characters
      return `SKU${Date.now().toString().slice(-8)}`;
    }
    
    let counter = 1;
    let sku = baseSku;
    
    // Try up to 999 variations
    while (counter <= 999) {
      const isValid = await validateSKU(sku);
      if (isValid) {
        return sku;
      }
      
      sku = `${baseSku}${counter.toString().padStart(3, '0')}`;
      counter++;
    }
    
    // Final fallback with timestamp
    return `SKU${Date.now().toString().slice(-8)}`;
  } catch (error) {
    console.error('Error generating unique SKU:', error);
    // Ultimate fallback
    return `SKU${Date.now().toString().slice(-8)}`;
  }
};