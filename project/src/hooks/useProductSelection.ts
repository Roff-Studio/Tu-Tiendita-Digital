import { useState, useCallback, useMemo } from 'react';
import { Product } from '../lib/supabase';

export interface SelectedProduct {
  id: string;
  name: string;
  price: string;
  imageUrl?: string;
  category?: string;
  selectedVariantId?: string;
  selectedVariantName?: string;
  quantity: number;
}

export interface ProductSelectionState {
  selectedProducts: SelectedProduct[];
  totalCount: number;
  totalItems: number;
}

export interface UseProductSelectionReturn {
  selectedProducts: SelectedProduct[];
  totalCount: number;
  totalItems: number;
  isSelected: (productId: string, variantId?: string) => boolean;
  getSelectedProduct: (productId: string, variantId?: string) => SelectedProduct | undefined;
  addProduct: (product: Product, variantId?: string, quantity?: number) => void;
  removeProduct: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  clearSelection: () => void;
  generateWhatsAppMessage: (storeOwner: { storeName: string; whatsappNumber: string }) => string;
  generateWhatsAppUrl: (storeOwner: { storeName: string; whatsappNumber: string }) => string;
}

const useProductSelection = (): UseProductSelectionReturn => {
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);

  // Generate unique key for product + variant combination
  const getProductKey = useCallback((productId: string, variantId?: string): string => {
    return variantId ? `${productId}-${variantId}` : productId;
  }, []);

  // Check if a product (with optional variant) is selected
  const isSelected = useCallback((productId: string, variantId?: string): boolean => {
    const key = getProductKey(productId, variantId);
    return selectedProducts.some(p => getProductKey(p.id, p.selectedVariantId) === key);
  }, [selectedProducts, getProductKey]);

  // Get selected product by ID and variant
  const getSelectedProduct = useCallback((productId: string, variantId?: string): SelectedProduct | undefined => {
    const key = getProductKey(productId, variantId);
    return selectedProducts.find(p => getProductKey(p.id, p.selectedVariantId) === key);
  }, [selectedProducts, getProductKey]);

  // Add product to selection
  const addProduct = useCallback((product: Product, variantId?: string, quantity: number = 1): void => {
    const key = getProductKey(product.id, variantId);
    
    setSelectedProducts(prev => {
      // Check if product already exists
      const existingIndex = prev.findIndex(p => getProductKey(p.id, p.selectedVariantId) === key);
      
      if (existingIndex >= 0) {
        // Update quantity if product already exists
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity
        };
        return updated;
      }

      // Calculate price
      let price = product.displayPrice || `$${product.basePrice.toLocaleString()}`;
      let variantName: string | undefined;

      if (variantId && product.variants) {
        const variant = product.variants.find(v => v.id === variantId);
        if (variant) {
          const finalPrice = product.basePrice + variant.priceModifier;
          price = `$${finalPrice.toLocaleString()}`;
          variantName = variant.name;
        }
      }

      // Add new product
      const newProduct: SelectedProduct = {
        id: product.id,
        name: product.name,
        price,
        imageUrl: product.images?.[0]?.imageUrl,
        category: product.category || undefined,
        selectedVariantId: variantId,
        selectedVariantName: variantName,
        quantity
      };

      return [...prev, newProduct];
    });
  }, [getProductKey]);

  // Remove product from selection
  const removeProduct = useCallback((productId: string, variantId?: string): void => {
    const key = getProductKey(productId, variantId);
    
    setSelectedProducts(prev => 
      prev.filter(p => getProductKey(p.id, p.selectedVariantId) !== key)
    );
  }, [getProductKey]);

  // Update product quantity
  const updateQuantity = useCallback((productId: string, variantId: string | undefined, quantity: number): void => {
    if (quantity <= 0) {
      removeProduct(productId, variantId);
      return;
    }

    const key = getProductKey(productId, variantId);
    
    setSelectedProducts(prev => 
      prev.map(p => 
        getProductKey(p.id, p.selectedVariantId) === key 
          ? { ...p, quantity }
          : p
      )
    );
  }, [getProductKey, removeProduct]);

  // Clear all selections
  const clearSelection = useCallback((): void => {
    setSelectedProducts([]);
  }, []);

  // Generate WhatsApp message
  const generateWhatsAppMessage = useCallback((storeOwner: { storeName: string; whatsappNumber: string }): string => {
    if (selectedProducts.length === 0) {
      return `Hola! Me interesa conocer más sobre los productos de ${storeOwner.storeName}.`;
    }

    let message = `Hola! Me interesan los siguientes productos de ${storeOwner.storeName}:\n\n`;

    selectedProducts.forEach((product, index) => {
      message += `${index + 1}. ${product.name}`;
      
      if (product.selectedVariantName) {
        message += ` - ${product.selectedVariantName}`;
      }
      
      message += ` (${product.price})`;
      
      if (product.quantity > 1) {
        message += ` x${product.quantity}`;
      }
      
      message += '\n';
    });

    message += '\n¿Podrías darme más información sobre disponibilidad y formas de pago?';

    return message;
  }, [selectedProducts]);

  // Generate WhatsApp URL
  const generateWhatsAppUrl = useCallback((storeOwner: { storeName: string; whatsappNumber: string }): string => {
    if (!storeOwner.whatsappNumber) return '#';
    
    const message = generateWhatsAppMessage(storeOwner);
    const encodedMessage = encodeURIComponent(message);
    
    return `https://wa.me/${storeOwner.whatsappNumber}?text=${encodedMessage}`;
  }, [generateWhatsAppMessage]);

  // Memoized computed values
  const computedValues = useMemo(() => {
    const totalCount = selectedProducts.length;
    const totalItems = selectedProducts.reduce((sum, product) => sum + product.quantity, 0);

    return {
      totalCount,
      totalItems
    };
  }, [selectedProducts]);

  return {
    selectedProducts,
    totalCount: computedValues.totalCount,
    totalItems: computedValues.totalItems,
    isSelected,
    getSelectedProduct,
    addProduct,
    removeProduct,
    updateQuantity,
    clearSelection,
    generateWhatsAppMessage,
    generateWhatsAppUrl
  };
};

export default useProductSelection;