import { renderHook, act } from '@testing-library/react';
import useProductSelection from '../hooks/useProductSelection';
import { Product } from '../lib/supabase';

// Mock product data
const mockProduct: Product = {
  id: 'product-1',
  name: 'Test Product',
  description: 'A test product',
  mainSku: 'TEST001',
  basePrice: 100,
  stockQuantity: 10,
  isAvailable: true,
  category: 'Test Category',
  position: 1,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  displayPrice: '$100',
  images: [{
    id: 'img-1',
    productId: 'product-1',
    imageUrl: 'https://example.com/image.jpg',
    position: 0,
    createdAt: '2025-01-01T00:00:00Z'
  }],
  variants: [{
    id: 'variant-1',
    productId: 'product-1',
    name: 'Size M',
    sku: 'TEST001-M',
    priceModifier: 10,
    stockQuantity: 5,
    isAvailable: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }]
};

const mockStoreOwner = {
  storeName: 'Test Store',
  whatsappNumber: '1234567890'
};

describe('useProductSelection', () => {
  it('should initialize with empty selection', () => {
    const { result } = renderHook(() => useProductSelection());
    
    expect(result.current.selectedProducts).toEqual([]);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.totalItems).toBe(0);
  });

  it('should add product to selection', () => {
    const { result } = renderHook(() => useProductSelection());
    
    act(() => {
      result.current.addProduct(mockProduct);
    });
    
    expect(result.current.selectedProducts).toHaveLength(1);
    expect(result.current.totalCount).toBe(1);
    expect(result.current.totalItems).toBe(1);
    expect(result.current.selectedProducts[0].name).toBe('Test Product');
  });

  it('should add product with variant to selection', () => {
    const { result } = renderHook(() => useProductSelection());
    
    act(() => {
      result.current.addProduct(mockProduct, 'variant-1', 2);
    });
    
    expect(result.current.selectedProducts).toHaveLength(1);
    expect(result.current.totalCount).toBe(1);
    expect(result.current.totalItems).toBe(2);
    expect(result.current.selectedProducts[0].selectedVariantId).toBe('variant-1');
    expect(result.current.selectedProducts[0].selectedVariantName).toBe('Size M');
    expect(result.current.selectedProducts[0].quantity).toBe(2);
  });

  it('should update quantity when adding same product', () => {
    const { result } = renderHook(() => useProductSelection());
    
    act(() => {
      result.current.addProduct(mockProduct, undefined, 1);
    });
    
    act(() => {
      result.current.addProduct(mockProduct, undefined, 2);
    });
    
    expect(result.current.selectedProducts).toHaveLength(1);
    expect(result.current.totalItems).toBe(3);
    expect(result.current.selectedProducts[0].quantity).toBe(3);
  });

  it('should check if product is selected', () => {
    const { result } = renderHook(() => useProductSelection());
    
    expect(result.current.isSelected('product-1')).toBe(false);
    
    act(() => {
      result.current.addProduct(mockProduct);
    });
    
    expect(result.current.isSelected('product-1')).toBe(true);
    expect(result.current.isSelected('product-1', 'variant-1')).toBe(false);
  });

  it('should remove product from selection', () => {
    const { result } = renderHook(() => useProductSelection());
    
    act(() => {
      result.current.addProduct(mockProduct);
    });
    
    expect(result.current.totalCount).toBe(1);
    
    act(() => {
      result.current.removeProduct('product-1');
    });
    
    expect(result.current.totalCount).toBe(0);
    expect(result.current.selectedProducts).toHaveLength(0);
  });

  it('should update product quantity', () => {
    const { result } = renderHook(() => useProductSelection());
    
    act(() => {
      result.current.addProduct(mockProduct, undefined, 1);
    });
    
    act(() => {
      result.current.updateQuantity('product-1', undefined, 5);
    });
    
    expect(result.current.selectedProducts[0].quantity).toBe(5);
    expect(result.current.totalItems).toBe(5);
  });

  it('should remove product when quantity is set to 0', () => {
    const { result } = renderHook(() => useProductSelection());
    
    act(() => {
      result.current.addProduct(mockProduct);
    });
    
    act(() => {
      result.current.updateQuantity('product-1', undefined, 0);
    });
    
    expect(result.current.totalCount).toBe(0);
    expect(result.current.selectedProducts).toHaveLength(0);
  });

  it('should clear all selections', () => {
    const { result } = renderHook(() => useProductSelection());
    
    act(() => {
      result.current.addProduct(mockProduct);
      result.current.addProduct({ ...mockProduct, id: 'product-2', name: 'Product 2' });
    });
    
    expect(result.current.totalCount).toBe(2);
    
    act(() => {
      result.current.clearSelection();
    });
    
    expect(result.current.totalCount).toBe(0);
    expect(result.current.selectedProducts).toHaveLength(0);
  });

  it('should generate WhatsApp message', () => {
    const { result } = renderHook(() => useProductSelection());
    
    act(() => {
      result.current.addProduct(mockProduct, undefined, 2);
    });
    
    const message = result.current.generateWhatsAppMessage(mockStoreOwner);
    
    expect(message).toContain('Test Store');
    expect(message).toContain('Test Product');
    expect(message).toContain('x2');
  });

  it('should generate WhatsApp URL', () => {
    const { result } = renderHook(() => useProductSelection());
    
    act(() => {
      result.current.addProduct(mockProduct);
    });
    
    const url = result.current.generateWhatsAppUrl(mockStoreOwner);
    
    expect(url).toContain('https://wa.me/1234567890');
    expect(url).toContain('text=');
  });

  it('should handle products with variants separately', () => {
    const { result } = renderHook(() => useProductSelection());
    
    // Add base product
    act(() => {
      result.current.addProduct(mockProduct, undefined, 1);
    });
    
    // Add same product with variant
    act(() => {
      result.current.addProduct(mockProduct, 'variant-1', 1);
    });
    
    expect(result.current.totalCount).toBe(2);
    expect(result.current.totalItems).toBe(2);
    expect(result.current.selectedProducts).toHaveLength(2);
  });

  it('should get selected product by ID and variant', () => {
    const { result } = renderHook(() => useProductSelection());
    
    act(() => {
      result.current.addProduct(mockProduct, 'variant-1', 3);
    });
    
    const selectedProduct = result.current.getSelectedProduct('product-1', 'variant-1');
    
    expect(selectedProduct).toBeDefined();
    expect(selectedProduct?.quantity).toBe(3);
    expect(selectedProduct?.selectedVariantId).toBe('variant-1');
    
    const nonExistent = result.current.getSelectedProduct('product-1', 'variant-2');
    expect(nonExistent).toBeUndefined();
  });
});