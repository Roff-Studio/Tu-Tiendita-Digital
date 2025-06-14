// FIXED: Centralized type definitions for better type safety

export interface UserProfile {
  id: string;
  email: string;
  storeSlug?: string | null;
  storeName?: string | null;
  whatsappNumber?: string | null;
  onboardingCompleted: boolean;
}

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

export interface DatabaseUser {
  id: string;
  email: string;
  store_slug: string | null;
  store_name: string | null;
  whatsapp_number: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseProduct {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  main_sku: string;
  base_price: number;
  stock_quantity: number;
  is_available: boolean;
  category: string | null;
  position: number | null;
  display_price: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseProductImage {
  id: string;
  product_id: string;
  image_url: string;
  position: number;
  created_at: string;
}

export interface DatabaseProductVariant {
  id: string;
  product_id: string;
  name: string;
  sku: string;
  price_modifier: number;
  stock_quantity: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

// Form validation types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingProps extends BaseComponentProps {
  isLoading: boolean;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export interface ErrorProps extends BaseComponentProps {
  error: Error | string;
  onRetry?: () => void;
  showRetry?: boolean;
}

// Event handler types
export type EventHandler<T = void> = () => T;
export type EventHandlerWithParam<P, T = void> = (param: P) => T;
export type AsyncEventHandler<T = void> = () => Promise<T>;
export type AsyncEventHandlerWithParam<P, T = void> = (param: P) => Promise<T>;

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;