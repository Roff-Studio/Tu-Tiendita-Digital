import React, { useState, useCallback, useMemo } from 'react';
import { Plus, Minus, Check, ShoppingCart, Eye, ChevronLeft, ChevronRight, Package, Tag } from 'lucide-react';
import { Product } from '../../lib/supabase';
import { SelectedProduct } from '../../hooks/useProductSelection';

interface ProductSelectionCardProps {
  product: Product;
  isSelected: boolean;
  selectedProduct?: SelectedProduct;
  onAddToSelection: (product: Product, variantId?: string, quantity?: number) => void;
  onRemoveFromSelection: (productId: string, variantId?: string) => void;
  onUpdateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  onQuickView?: (product: Product) => void;
}

const ProductSelectionCard: React.FC<ProductSelectionCardProps> = ({
  product,
  isSelected,
  selectedProduct,
  onAddToSelection,
  onRemoveFromSelection,
  onUpdateQuantity,
  onQuickView
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [imageLoading, setImageLoading] = useState<Set<string>>(new Set());

  // Handle image navigation
  const nextImage = useCallback(() => {
    if (product.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images!.length);
    }
  }, [product.images]);

  const prevImage = useCallback(() => {
    if (product.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images!.length) % product.images!.length);
    }
  }, [product.images]);

  // Handle image loading states
  const handleImageLoad = useCallback((imageUrl: string) => {
    setImageLoading(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageUrl);
      return newSet;
    });
  }, []);

  const handleImageError = useCallback((imageUrl: string) => {
    setImageErrors(prev => new Set(prev).add(imageUrl));
    setImageLoading(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageUrl);
      return newSet;
    });
  }, []);

  const handleImageLoadStart = useCallback((imageUrl: string) => {
    setImageLoading(prev => new Set(prev).add(imageUrl));
  }, []);

  // Calculate current price based on selected variant
  const currentPrice = useMemo(() => {
    if (selectedVariantId && product.variants) {
      const variant = product.variants.find(v => v.id === selectedVariantId);
      if (variant) {
        const finalPrice = product.basePrice + variant.priceModifier;
        return `$${finalPrice.toLocaleString()}`;
      }
    }
    return product.displayPrice || `$${product.basePrice.toLocaleString()}`;
  }, [selectedVariantId, product.variants, product.basePrice, product.displayPrice]);

  // Get available variants
  const availableVariants = useMemo(() => {
    return product.variants?.filter(variant => variant.isAvailable && variant.stockQuantity > 0) || [];
  }, [product.variants]);

  // Handle selection toggle
  const handleSelectionToggle = useCallback(() => {
    if (isSelected) {
      onRemoveFromSelection(product.id, selectedProduct?.selectedVariantId);
    } else {
      onAddToSelection(product, selectedVariantId || undefined, 1);
    }
  }, [isSelected, product, selectedVariantId, selectedProduct, onAddToSelection, onRemoveFromSelection]);

  // Handle quantity change
  const handleQuantityChange = useCallback((newQuantity: number) => {
    const variantId = selectedProduct?.selectedVariantId;
    onUpdateQuantity(product.id, variantId, newQuantity);
  }, [product.id, selectedProduct, onUpdateQuantity]);

  // Handle variant change
  const handleVariantChange = useCallback((variantId: string) => {
    setSelectedVariantId(variantId);
    
    // If product is already selected, update the selection with new variant
    if (isSelected && selectedProduct) {
      onRemoveFromSelection(product.id, selectedProduct.selectedVariantId);
      onAddToSelection(product, variantId || undefined, selectedProduct.quantity);
    }
  }, [isSelected, selectedProduct, product, onAddToSelection, onRemoveFromSelection]);

  const currentImage = product.images?.[currentImageIndex];
  const hasMultipleImages = product.images && product.images.length > 1;

  return (
    <div className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-300 overflow-hidden ${
      isSelected 
        ? 'border-blue-500 shadow-lg transform scale-[1.02]' 
        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
    }`}>
      {/* Image Container */}
      <div className="relative aspect-square bg-gray-100">
        {currentImage && !imageErrors.has(currentImage.imageUrl) ? (
          <>
            {imageLoading.has(currentImage.imageUrl) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
            <img
              src={currentImage.imageUrl}
              alt={product.name}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoading.has(currentImage.imageUrl) ? 'opacity-0' : 'opacity-100'
              }`}
              onLoadStart={() => handleImageLoadStart(currentImage.imageUrl)}
              onLoad={() => handleImageLoad(currentImage.imageUrl)}
              onError={() => handleImageError(currentImage.imageUrl)}
              loading="lazy"
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-12 w-12 text-gray-400" />
          </div>
        )}

        {/* Image Navigation */}
        {hasMultipleImages && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
              aria-label="Imagen siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            
            {/* Image Indicators */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {product.images?.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                  }`}
                  aria-label={`Ver imagen ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Selection Status Badge */}
        {isSelected && (
          <div className="absolute top-2 left-2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
            <Check className="h-4 w-4" />
            <span>Seleccionado</span>
          </div>
        )}

        {/* Quick View Button */}
        {onQuickView && (
          <button
            onClick={() => onQuickView(product)}
            className="absolute top-2 right-2 bg-white bg-opacity-90 text-gray-700 p-2 rounded-full hover:bg-white transition-all shadow-sm"
            aria-label="Vista rápida"
          >
            <Eye className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Product Info */}
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-2">
            {product.name}
          </h3>
          {product.category && (
            <div className="flex items-center space-x-1 text-sm text-gray-500 mb-2">
              <Tag className="h-3 w-3" />
              <span>{product.category}</span>
            </div>
          )}
          <div className="text-2xl font-bold text-blue-600">
            {currentPrice}
          </div>
        </div>

        {/* Variant Selection */}
        {availableVariants.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opciones:
            </label>
            <select
              value={selectedVariantId}
              onChange={(e) => handleVariantChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">Producto base</option>
              {availableVariants.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {variant.name} {variant.priceModifier !== 0 && `(${variant.priceModifier > 0 ? '+' : ''}$${variant.priceModifier.toLocaleString()})`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Description */}
        {product.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Selection Controls */}
        <div className="space-y-3">
          {!isSelected ? (
            <button
              onClick={handleSelectionToggle}
              disabled={!product.isAvailable}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>{product.isAvailable ? 'Seleccionar' : 'No disponible'}</span>
            </button>
          ) : (
            <div className="space-y-3">
              {/* Quantity Controls */}
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <span className="text-sm font-medium text-gray-700">Cantidad:</span>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleQuantityChange((selectedProduct?.quantity || 1) - 1)}
                    className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-colors"
                    aria-label="Disminuir cantidad"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-lg font-semibold min-w-[2rem] text-center">
                    {selectedProduct?.quantity || 1}
                  </span>
                  <button
                    onClick={() => handleQuantityChange((selectedProduct?.quantity || 1) + 1)}
                    className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-colors"
                    aria-label="Aumentar cantidad"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Remove Button */}
              <button
                onClick={handleSelectionToggle}
                className="w-full bg-red-50 text-red-600 py-2 px-4 rounded-lg font-medium hover:bg-red-100 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors border border-red-200"
              >
                Quitar de selección
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductSelectionCard;