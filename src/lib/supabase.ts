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

// ENHANCED: Optimized fetch with pagination and category filtering
export const fetchPublicCatalogData = async (
  storeSlug: string, 
  page: number = 1, 
  pageSize: number = 20,
  category?: string
) => {
  try {
    console.log(`🚀 OPTIMIZED: Fetching public catalog data for: ${storeSlug}, page: ${page}, category: ${category || 'all'}`);
    
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Query timeout'));
      }, TIMEOUTS.DEFAULT_REQUEST);
    });

    // Build query with pagination and optional category filter
    let query = supabase
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
      .eq('products.is_available', true);
    
    // Add category filter if provided
    if (category) {
      query = query.eq('products.category', category);
    }
    
    // Add pagination
    query = query.range(from, to);
    
    // Add ordering
    query = query.order('position', { foreignTable: 'products', ascending: true, nullsLast: true })
                .order('created_at', { foreignTable: 'products', ascending: false });
    
    const { data: storeData, error: storeError } = await Promise.race([query.single(), timeoutPromise]);

    if (storeError || !storeData) {
      console.error('❌ Store not found or error:', storeError);
      
      // Special handling for first page - throw error
      if (page === 1) {
        throw new Error('Tienda no encontrada');
      }
      
      // For subsequent pages, return empty products array
      return {
        storeOwner: { storeName: '', whatsappNumber: '' },
        products: []
      };
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

    const result = {
      storeOwner: {
        storeName: storeData.store_name || 'Mi Tienda',
        whatsappNumber: storeData.whatsapp_number || ''
      },
      products
    };

    console.log(`✅ OPTIMIZED: Public catalog fetch completed with ${products.length} products for page ${page}`);
    return result;
  } catch (error: any) {
    console.error('💥 Error in fetchPublicCatalogData:', error);
    throw new Error(error.message || ERROR_MESSAGES.SERVER_ERROR);
  }
};

// Other functions remain unchanged...