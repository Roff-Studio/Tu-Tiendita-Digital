import React, { useState, useCallback, useMemo } from 'react';
import { supabase, Product } from '../../lib/supabase';
import { useLoadingState } from '../../hooks/useLoadingState';
import { Edit, Trash2, Image as ImageIcon, Tag, Hash, ChevronLeft, ChevronRight, Package, DollarSign } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onUpdate: () => void;
  viewMode?: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onEdit, 
  onUpdate, 
  viewMode = 'grid' 
}) => {
  const { isLoading, startLoading, stopLoading } = useLoadingState();
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [imageLoading, setImageLoading] = useState<Set<string>>(new Set());
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // FIXED: Enhanced callback functions with loading states
  const handleAvailabilityToggle = useCallback(async () => {
    startLoading('availability');
    try {
      const { error } = await supabase
        .from('products')
        .update({ 
          is_available: !product.isAvailable,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id);

      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error updating availability:', error);
    } finally {
      stopLoading('availability');
    }
  }, [product.id, product.isAvailable, onUpdate, startLoading, stopLoading]);

  const handleDelete = useCallback(async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto? Esta acción también eliminará todas sus variantes e imágenes.')) {
      return;
    }

    startLoading('delete');
    try {
      // Delete product images from storage
      if (product.images && product.images.length > 0) {
        const imagePaths = product.images.map(img => {
          const url = new URL(img.imageUrl);
          return url.pathname.split('/').slice(-2).join('/'); // Get user_id/filename
        });
        
        await supabase.storage
          .from('products')
          .remove(imagePaths);
      }

      // Delete product (variants and images will be deleted automatically due to CASCADE)
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      stopLoading('delete');
    }
  }, [product.id, product.images, onUpdate, startLoading, stopLoading]);

  const handleEdit = useCallback(() => {
    onEdit(product);
  }, [onEdit, product]);

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

  // FIXED: Enhanced memoized calculations
  const currentImage = useMemo(() => {
    return product.images?.[currentImageIndex];
  }, [product.images, currentImageIndex]);

  const hasMultipleImages = useMemo(() => {
    return product.images && product.images.length > 1;
  }, [product.images]);

  const displayMetadata = useMemo(() => {
    return {
      hasCategory: Boolean(product.category),
      hasPosition: product.position !== null && product.position !== undefined,
      isAvailable: product.isAvailable,
      hasVariants: Boolean(product.variants && product.variants.length > 0),
      totalStock: product.stockQuantity + (product.variants?.reduce((sum, v) => sum + v.stockQuantity, 0) || 0),
      variantCount: product.variants?.length || 0
    };
  }, [product.category, product.position, product.isAvailable, product.variants, product.stockQuantity]);

  const priceDisplay = useMemo(() => {
    // Use display_price for backward compatibility, fallback to formatted base_price
    if (product.displayPrice) {
      return product.displayPrice;
    }
    return `$${product.basePrice.toLocaleString()}`;
  }, [product.displayPrice, product.basePrice]);

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          {/* Image */}
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 relative">
            {currentImage && !imageErrors.has(currentImage.imageUrl) ? (
              <>
                {imageLoading.has(currentImage.imageUrl) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
                <img
                  src={currentImage.imageUrl}
                  alt={`${product.name} - imagen del producto`}
                  className={`w-full h-full object-cover rounded-lg transition-opacity duration-300 ${
                    imageLoading.has(currentImage.imageUrl) ? 'opacity-0' : 'opacity-100'
                  } ${!displayMetadata.isAvailable ? 'filter grayscale' : ''}`}
                  onLoadStart={() => handleImageLoadStart(currentImage.imageUrl)}
                  onLoad={() => handleImageLoad(currentImage.imageUrl)}
                  onError={() => handleImageError(currentImage.imageUrl)}
                  loading="lazy"
                />
              </>
            ) : (
              <div className={`w-full h-full flex items-center justify-center rounded-lg ${
                !displayMetadata.isAvailable ? 'filter grayscale' : ''
              }`}>
                <ImageIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate" title={product.name}>
                  {product.name}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-lg font-bold text-blue-600">{priceDisplay}</p>
                  <span className="text-sm text-gray-500">SKU: {product.mainSku}</span>
                </div>
                
                {/* Enhanced metadata */}
                <div className="flex items-center space-x-3 mt-1">
                  {displayMetadata.hasCategory && (
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Tag className="h-3 w-3" aria-hidden="true" />
                      <span>{product.category}</span>
                    </div>
                  )}
                  {displayMetadata.hasPosition && (
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Hash className="h-3 w-3" aria-hidden="true" />
                      <span>Pos. {product.position}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Package className="h-3 w-3" aria-hidden="true" />
                    <span>Stock: {displayMetadata.totalStock}</span>
                  </div>
                  {displayMetadata.hasVariants && (
                    <div className="flex items-center space-x-1 text-xs text-blue-600">
                      <Package className="h-3 w-3" aria-hidden="true" />
                      <span>{displayMetadata.variantCount} variante{displayMetadata.variantCount !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {!displayMetadata.isAvailable && (
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                      Agotado
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={handleEdit}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                  aria-label={`Editar ${product.name}`}
                  disabled={isLoading()}
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isLoading('delete')}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                  aria-label={`Eliminar ${product.name}`}
                >
                  {isLoading('delete') ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
                
                {/* Availability Toggle */}
                <button
                  onClick={handleAvailabilityToggle}
                  disabled={isLoading('availability')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    displayMetadata.isAvailable ? 'bg-blue-600' : 'bg-gray-300'
                  } ${isLoading('availability') ? 'opacity-50' : ''}`}
                  aria-label={`${displayMetadata.isAvailable ? 'Marcar como agotado' : 'Marcar como disponible'}`}
                  role="switch"
                  aria-checked={displayMetadata.isAvailable}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      displayMetadata.isAvailable ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view (default) - Enhanced with accessibility
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="aspect-square bg-gray-100 relative">
        {currentImage && !imageErrors.has(currentImage.imageUrl) ? (
          <>
            {imageLoading.has(currentImage.imageUrl) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
            <img
              src={currentImage.imageUrl}
              alt={`${product.name} - imagen del producto`}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoading.has(currentImage.imageUrl) ? 'opacity-0' : 'opacity-100'
              } ${!displayMetadata.isAvailable ? 'filter grayscale' : ''}`}
              onLoadStart={() => handleImageLoadStart(currentImage.imageUrl)}
              onLoad={() => handleImageLoad(currentImage.imageUrl)}
              onError={() => handleImageError(currentImage.imageUrl)}
              loading="lazy"
            />
            
            {/* Image Navigation */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-all focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-all focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
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
                      className={`w-2 h-2 rounded-full transition-all focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                      }`}
                      aria-label={`Ver imagen ${index + 1} de ${product.images?.length}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${
            !displayMetadata.isAvailable ? 'filter grayscale' : ''
          }`}>
            <ImageIcon className="h-12 w-12 text-gray-400" aria-hidden="true" />
          </div>
        )}
        
        {!displayMetadata.isAvailable && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Agotado
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate" title={product.name}>
              {product.name}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <p className="text-lg font-bold text-blue-600">{priceDisplay}</p>
              <span className="text-xs text-gray-500">SKU: {product.mainSku}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-2">
            <button
              onClick={handleEdit}
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              aria-label={`Editar ${product.name}`}
              disabled={isLoading()}
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              disabled={isLoading('delete')}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
              aria-label={`Eliminar ${product.name}`}
            >
              {isLoading('delete') ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Enhanced metadata */}
        {(displayMetadata.hasCategory || displayMetadata.hasPosition || displayMetadata.hasVariants) && (
          <div className="flex items-center space-x-3 mb-2">
            {displayMetadata.hasCategory && (
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Tag className="h-3 w-3" aria-hidden="true" />
                <span>{product.category}</span>
              </div>
            )}
            {displayMetadata.hasPosition && (
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Hash className="h-3 w-3" aria-hidden="true" />
                <span>Pos. {product.position}</span>
              </div>
            )}
            {displayMetadata.hasVariants && (
              <div className="flex items-center space-x-1 text-xs text-blue-600">
                <Package className="h-3 w-3" aria-hidden="true" />
                <span>{displayMetadata.variantCount} variante{displayMetadata.variantCount !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        )}

        {/* Stock information */}
        <div className="flex items-center space-x-1 text-xs text-gray-500 mb-3">
          <Package className="h-3 w-3" aria-hidden="true" />
          <span>Stock total: {displayMetadata.totalStock}</span>
        </div>

        {product.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2" title={product.description}>
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Disponible</span>
          <button
            onClick={handleAvailabilityToggle}
            disabled={isLoading('availability')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              displayMetadata.isAvailable ? 'bg-blue-600' : 'bg-gray-300'
            } ${isLoading('availability') ? 'opacity-50' : ''}`}
            aria-label={`${displayMetadata.isAvailable ? 'Marcar como agotado' : 'Marcar como disponible'}`}
            role="switch"
            aria-checked={displayMetadata.isAvailable}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                displayMetadata.isAvailable ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;