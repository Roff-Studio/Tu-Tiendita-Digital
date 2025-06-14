import React, { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import { ProductVariant } from '../../lib/supabase';

interface ProductVariantSelectorProps {
  variants: ProductVariant[];
  basePrice: number;
  selectedVariantId: string;
  onVariantChange: (variantId: string) => void;
  disabled?: boolean;
}

const ProductVariantSelector: React.FC<ProductVariantSelectorProps> = ({
  variants,
  basePrice,
  selectedVariantId,
  onVariantChange,
  disabled = false
}) => {
  const [availableVariants, setAvailableVariants] = useState<ProductVariant[]>([]);
  
  // Filter available variants
  useEffect(() => {
    const filtered = variants.filter(variant => 
      variant.isAvailable && variant.stockQuantity > 0
    );
    setAvailableVariants(filtered);
  }, [variants]);
  
  // Get selected variant
  const selectedVariant = selectedVariantId 
    ? variants.find(v => v.id === selectedVariantId) 
    : null;
  
  if (availableVariants.length === 0) {
    return null;
  }
  
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Opciones:
      </label>
      <select
        value={selectedVariantId || ''}
        onChange={(e) => onVariantChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        disabled={disabled}
      >
        <option value="">Producto base</option>
        {availableVariants.map((variant) => {
          const finalPrice = basePrice + variant.priceModifier;
          const priceDisplay = variant.priceModifier !== 0 
            ? `(${variant.priceModifier > 0 ? '+' : ''}$${variant.priceModifier.toLocaleString()} = $${finalPrice.toLocaleString()})` 
            : '';
            
          return (
            <option key={variant.id} value={variant.id}>
              {variant.name} {priceDisplay}
            </option>
          );
        })}
      </select>
      
      {selectedVariant && (
        <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
          <Package className="h-3 w-3" />
          <span>Stock: {selectedVariant.stockQuantity}</span>
        </div>
      )}
    </div>
  );
};

export default React.memo(ProductVariantSelector);