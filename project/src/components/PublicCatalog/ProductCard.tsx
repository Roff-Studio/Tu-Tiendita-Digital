import React, { useState, useCallback } from 'react';
import { MessageCircle } from 'lucide-react';
import { Product } from '../../lib/supabase';
import ImageCarousel from './ImageCarousel';
import ProductVariantSelector from './ProductVariantSelector';

interface ProductCardProps {
  product: Product;
  generateWhatsAppUrlSingle: (product: Product, selectedVariantId?: string) => string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  generateWhatsAppUrlSingle
}) => {
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  
  // Handle variant change
  const handleVariantChange = useCallback((variantId: string) => {
    setSelectedVariantId(variantId);
  }, []);
  
  // Calculate price based on selected variant
  const getProductPrice = useCallback(() => {
    if (selectedVariantId && product.variants) {
      const variant = product.variants.find(v => v.id === selectedVariantId);
      if (variant) {
        const finalPrice = product.basePrice + variant.priceModifier;
        return `$${finalPrice.toLocaleString()}`;
      }
    }
    
    // Use display_price for backward compatibility, fallback to formatted base_price
    if (product.displayPrice) {
      return product.displayPrice;
    }
    return `$${product.basePrice.toLocaleString()}`;
  }, [product, selectedVariantId]);
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Image Carousel Component */}
      <ImageCarousel 
        images={product.images || []}
        productName={product.name}
        isAvailable={product.isAvailable}
      />

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1" title={product.name}>
              {product.name}
            </h3>
            {product.category && (
              <div className="flex items-center space-x-1 text-xs text-gray-500 mb-1">
                <span>{product.category}</span>
              </div>
            )}
          </div>
        </div>
        
        <p className="text-2xl font-bold text-blue-600 mb-2">{getProductPrice()}</p>
        
        {/* Variant Selector Component */}
        {product.variants && product.variants.length > 0 && (
          <ProductVariantSelector
            variants={product.variants}
            basePrice={product.basePrice}
            selectedVariantId={selectedVariantId}
            onVariantChange={handleVariantChange}
          />
        )}
        
        {product.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2" title={product.description}>
            {product.description}
          </p>
        )}

        <a
          href={generateWhatsAppUrlSingle(product, selectedVariantId)}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 touch-manipulation"
          aria-label={`Contactar por WhatsApp sobre ${product.name}${selectedVariantId ? ` - ${product.variants?.find(v => v.id === selectedVariantId)?.name}` : ''}`}
        >
          <MessageCircle className="h-5 w-5" />
          <span>Pedir por WhatsApp</span>
        </a>
      </div>
    </div>
  );
};

export default React.memo(ProductCard);