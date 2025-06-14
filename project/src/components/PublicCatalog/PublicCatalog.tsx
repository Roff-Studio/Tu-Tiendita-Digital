import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPublicCatalogData, Product } from '../../lib/supabase';
import { MessageCircle, Store, Image as ImageIcon, Tag, Filter, X, ChevronLeft, ChevronRight, Package, DollarSign, ToggleLeft, ToggleRight, Users, ShoppingCart } from 'lucide-react';
import useProductSelection from '../../hooks/useProductSelection';
import ProductSelectionCard from './ProductSelectionCard';
import FloatingActionButton from './FloatingActionButton';
import SelectionSummary from './SelectionSummary';
import AboutUsTrigger from '../Brand/AboutUsTrigger';
import AboutUsModal from '../Brand/AboutUsModal';
interface StoreOwner {
storeName: string;
whatsappNumber: string;
}

interface TouchState {
startX: number;
startY: number;
currentX: number;
currentY: number;
isDragging: boolean;
productId: string;
}

const PublicCatalog: React.FC = () => {
const { slug } = useParams<{ slug: string }>();
const [products, setProducts] = useState<Product[]>([]);
const [storeOwner, setStoreOwner] = useState<StoreOwner | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');
const [imageErrors, setImageErrors] = useState<Set>(new Set());
const [imageLoading, setImageLoading] = useState<Set>(new Set());
const [selectedCategory, setSelectedCategory] = useState('');
const [showCategoryFilter, setShowCategoryFilter] = useState(false);
const [currentImageIndexes, setCurrentImageIndexes] = useState<Record<string, number>>({});
const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
const [selectionMode, setSelectionMode] = useState(true); // CHANGED: Default to true
const [showAboutModal, setShowAboutModal] = useState(false);

// Product selection hook
const {
selectedProducts,
totalCount,
totalItems,
isSelected,
getSelectedProduct,
addProduct,
removeProduct,
updateQuantity,
clearSelection,
generateWhatsAppUrl
} = useProductSelection();

// Show selection summary modal
const [showSelectionSummary, setShowSelectionSummary] = useState(false);

// FIXED: Enhanced mobile touch handling
const [touchState, setTouchState] = useState<TouchState | null>(null);
const touchThreshold = 50; // Minimum distance for swipe
const mountedRef = useRef(true);
const abortControllerRef = useRef<AbortController | null>(null);

// FIXED: Enhanced touch event handlers for mobile swipe
const handleTouchStart = useCallback((e: React.TouchEvent, productId: string) => {
const touch = e.touches[0];
setTouchState({
startX: touch.clientX,
startY: touch.clientY,
currentX: touch.clientX,
currentY: touch.clientY,
isDragging: false,
productId
});
}, []);

const handleTouchMove = useCallback((e: React.TouchEvent) => {
if (!touchState) return;


const touch = e.touches[0];
const deltaX = Math.abs(touch.clientX - touchState.startX);
const deltaY = Math.abs(touch.clientY - touchState.startY);

// Prevent scrolling if horizontal swipe is detected
if (deltaX > deltaY && deltaX > 10) {
  e.preventDefault();
}

setTouchState(prev => prev ? {
  ...prev,
  currentX: touch.clientX,
  currentY: touch.clientY,
  isDragging: deltaX > 10 || deltaY > 10
} : null);
}, [touchState]);

const handleTouchEnd = useCallback((productId: string, maxImages: number) => {
if (!touchState || touchState.productId !== productId) return;


const deltaX = touchState.currentX - touchState.startX;
const deltaY = Math.abs(touchState.currentY - touchState.startY);

// Only process horizontal swipes
if (Math.abs(deltaX) > touchThreshold && Math.abs(deltaX) > deltaY) {
  if (deltaX > 0) {
    // Swipe right - previous image
    prevImage(productId, maxImages);
  } else {
    // Swipe left - next image
    nextImage(productId, maxImages);
  }
}

setTouchState(null);
}, [touchState]);

// FIXED: Memory-optimized callback functions
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

const nextImage = useCallback((productId: string, maxIndex: number) => {
setCurrentImageIndexes(prev => ({
...prev,
[productId]: ((prev[productId] || 0) + 1) % maxIndex
}));
}, []);

const prevImage = useCallback((productId: string, maxIndex: number) => {
setCurrentImageIndexes(prev => ({
...prev,
[productId]: ((prev[productId] || 0) - 1 + maxIndex) % maxIndex
}));
}, []);

// FIXED: Enhanced WhatsApp URL generation with proper encoding
const generateWhatsAppUrlSingle = useCallback((product: Product, selectedVariantId?: string) => {
if (!storeOwner?.whatsappNumber) return '#';


let message = `Hola! Te escribo por el producto '${product.name}'`;

// Add variant information if selected
if (selectedVariantId && product.variants) {
  const variant = product.variants.find(v => v.id === selectedVariantId);
  if (variant) {
    message += ` - ${variant.name}`;
  }
}

message += ' que vi en tu catálogo.';

const encodedMessage = encodeURIComponent(message);
return `https://wa.me/${storeOwner.whatsappNumber}?text=${encodedMessage}`;
}, [storeOwner?.whatsappNumber]);

const handleCategoryChange = useCallback((category: string) => {
setSelectedCategory(category);
setShowCategoryFilter(false);
}, []);

const toggleCategoryFilter = useCallback(() => {
setShowCategoryFilter(prev => !prev);
}, []);

const handleVariantChange = useCallback((productId: string, variantId: string) => {
setSelectedVariants(prev => ({
...prev,
[productId]: variantId
}));
}, []);

// Product selection handlers
const handleAddToSelection = useCallback((product: Product, variantId?: string, quantity?: number) => {
addProduct(product, variantId, quantity);
}, [addProduct]);

const handleRemoveFromSelection = useCallback((productId: string, variantId?: string) => {
removeProduct(productId, variantId);
}, [removeProduct]);

const handleUpdateQuantity = useCallback((productId: string, variantId: string | undefined, quantity: number) => {
updateQuantity(productId, variantId, quantity);
}, [updateQuantity]);

const handleSendWhatsApp = useCallback(() => {
if (storeOwner) {
console.log('WhatsApp message sent with', totalCount, 'products');
}
}, [storeOwner, totalCount]);

// FIXED: Enhanced data fetching with proper error handling and cleanup
useEffect(() => {
mountedRef.current = true;


const fetchStoreData = async () => {
  if (!slug) {
    if (mountedRef.current) {
      setError('URL de tienda no válida');
      setLoading(false);
    }
    return;
  }

  // Cancel previous request
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
  }

  abortControllerRef.current = new AbortController();
  const signal = abortControllerRef.current.signal;

  try {
    console.log('🚀 OPTIMIZED: Fetching public catalog with single query');
    
    const { storeOwner: owner, products: productsData } = await fetchPublicCatalogData(slug);

    if (signal.aborted || !mountedRef.current) return;

    setStoreOwner(owner);
    setProducts(productsData);

    // FIXED: Enhanced SEO meta updates with proper cleanup
    const originalTitle = document.title;
    const metaDescription = document.querySelector('meta[name="description"]');
    const originalDescription = metaDescription?.getAttribute('content');

    document.title = `${owner.storeName} - Catálogo de Productos`;
    
    if (metaDescription) {
      metaDescription.setAttribute('content', `Explora el catálogo de productos de ${owner.storeName}. Encuentra los mejores productos y contacta directamente por WhatsApp.`);
    }

    // Store cleanup function
    const cleanup = () => {
      document.title = originalTitle;
      if (metaDescription && originalDescription) {
        metaDescription.setAttribute('content', originalDescription);
      }
    };

    // Return cleanup function for later use
    return cleanup;

  } catch (error: any) {
    if (!signal.aborted && mountedRef.current) {
      console.error('💥 Error fetching store data:', error);
      if (error.name === 'AbortError') return;
      
      setError(error.message || 'Error al cargar la tienda');
    }
  } finally {
    if (!signal.aborted && mountedRef.current) {
      setLoading(false);
    }
  }
};

let metaCleanup: (() => void) | undefined;

fetchStoreData().then(cleanup => {
  metaCleanup = cleanup;
});

// FIXED: Comprehensive cleanup
return () => {
  console.log('🧹 PublicCatalog: Cleaning up...');
  mountedRef.current = false;
  
  // Abort pending requests
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
    abortControllerRef.current = null;
  }
  
  // Reset meta tags
  if (metaCleanup) {
    metaCleanup();
  }
};
}, [slug]);

// FIXED: Enhanced memoized calculations with stable dependencies
const availableProducts = useMemo((): Product[] => {
return products.filter(p => p.isAvailable);
}, [products]);

const categories = useMemo((): string[] => {
return Array.from(new Set(availableProducts.filter(p => p.category).map(p => p.category!))).sort();
}, [availableProducts]);

const filteredProducts = useMemo((): Product[] => {
return availableProducts.filter(product =>
selectedCategory ? product.category === selectedCategory : true
);
}, [availableProducts, selectedCategory]);

const productStats = useMemo(() => {
return {
total: filteredProducts.length,
hasCategory: selectedCategory !== ''
};
}, [filteredProducts.length, selectedCategory]);

// FIXED: Enhanced price calculation with variant support
const getProductPrice = useCallback((product: Product) => {
const selectedVariantId = selectedVariants[product.id];
if (selectedVariantId && product.variants) {
const variant = product.variants.find(v => v.id === selectedVariantId);    if (variant) {
      const finalPrice = product.basePrice + variant.priceModifier;
      return `$${finalPrice.toLocaleString()}`;
    }
  }


// Use display_price for backward compatibility, fallback to formatted base_price
if (product.displayPrice) {
  return product.displayPrice;
}
return `$${product.basePrice.toLocaleString()}`;
}, [selectedVariants]);

// Generate WhatsApp URL for multiple products
const whatsAppUrl = useMemo(() => {
return storeOwner ? generateWhatsAppUrl(storeOwner) : '#';
}, [storeOwner, generateWhatsAppUrl]);

// FIXED: Enhanced loading state with better UX
if (loading) {
return (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Cargando catálogo...</h2>
      <p className="text-gray-600">Esto puede tomar unos segundos</p>
    </div>
  </div>
);
}
if (error) {
return (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-4">
        <h2 className="text-xl font-semibold mb-2">{error}</h2>
        <p className="text-red-600">Verifica que la URL sea correcta</p>
      </div>
      <button 
        onClick={() => window.location.reload()} 
        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Reintentar
      </button>
    </div>
  </div>
);
}
return (
<div className="min-h-screen bg-gray-50">
  {/* Enhanced Header */}
  <header className="bg-white shadow-sm border-b border-gray-200">
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Store className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">{storeOwner?.storeName}</h1>
        </div>
        <p className="text-gray-600 text-lg">Catálogo de productos</p>


        {/* ENHANCED: Prominent Selection Mode Toggle */}
        <div className="flex items-center justify-center space-x-6 mt-6">
          <p className="text-sm text-gray-500">
            {productStats.total} producto{productStats.total !== 1 ? 's' : ''} disponible{productStats.total !== 1 ? 's' : ''}
            {productStats.hasCategory && ` en "${selectedCategory}"`}
          </p>
          
          {/* ENHANCED: Prominent Selection Mode Toggle Button */}
          <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl px-6 py-3 shadow-sm">
            <div className="flex items-center space-x-2">
              {selectionMode ? (
                <Users className="h-5 w-5 text-blue-600" />
              ) : (
                <ShoppingCart className="h-5 w-5 text-gray-500" />
              )}
              <span className={`font-medium text-sm ${selectionMode ? 'text-blue-700' : 'text-gray-600'}`}>
                Selección Múltiple
              </span>
            </div>
            
            <button
              onClick={() => setSelectionMode(!selectionMode)}
              className={`flex items-center space-x-2 transition-all duration-300 transform hover:scale-105 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg px-3 py-2 ${
                selectionMode 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
              title={selectionMode ? 'Cambiar a selección individual' : 'Cambiar a selección múltiple'}
            >
              {selectionMode ? (
                <>
                  <ToggleRight className="h-5 w-5" />
                  <span className="text-sm font-medium">Activo</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="h-5 w-5" />
                  <span className="text-sm font-medium">Inactivo</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ENHANCED: Helper Text for Selection Mode */}
        {selectionMode && (
          <div className="mt-3 inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm">
            <ShoppingCart className="h-4 w-4" />
            <span>Selecciona múltiples productos y envía todo por WhatsApp</span>
          </div>
        )}
      </div>
    </div>
  </header>

  {/* Enhanced Category Filter */}
  {categories.length > 0 && (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Mobile filter toggle */}
        <div className="sm:hidden mb-3">
          <button
            onClick={toggleCategoryFilter}
            className="flex items-center space-x-2 text-gray-700 font-medium w-full justify-between"
          >
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filtrar por categoría</span>
              {selectedCategory && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  {selectedCategory}
                </span>
              )}
            </div>
            <X className={`h-4 w-4 transition-transform ${showCategoryFilter ? 'rotate-45' : ''}`} />
          </button>
        </div>

        {/* Filter options */}
        <div className={`${showCategoryFilter ? 'block' : 'hidden'} sm:block`}>
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            <button
              onClick={() => handleCategoryChange('')}
              className={`flex items-center space-x-1 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === '' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>Todos</span>
              {selectedCategory === '' && (
                <span className="text-xs">({availableProducts.length})</span>
              )}
            </button>
            {categories.map((category) => {
              const categoryCount = availableProducts.filter(p => p.category === category).length;
              return (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`flex items-center space-x-1 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Tag className="h-3 w-3" />
                  <span>{category}</span>
                  <span className="text-xs">({categoryCount})</span>
                </button>
              );
            })}
            
            {/* Clear filter button for mobile */}
            {selectedCategory && (
              <button
                onClick={() => handleCategoryChange('')}
                className="sm:hidden flex items-center space-x-1 px-3 py-2 rounded-full text-sm text-gray-500 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
                <span>Limpiar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )}

  {/* Enhanced Products Grid */}
  <main className="max-w-4xl mx-auto px-4 py-8">
    {filteredProducts.length === 0 ? (
      <div className="text-center py-12">
        <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-medium text-gray-900 mb-2">
          {selectedCategory 
            ? `No hay productos disponibles en "${selectedCategory}"` 
            : availableProducts.length === 0
              ? 'No hay productos disponibles'
              : 'No hay productos en esta categoría'
          }
        </h2>
        <p className="text-gray-600 mb-4">
          {selectedCategory 
            ? 'Prueba con otra categoría' 
            : 'Esta tienda aún no tiene productos disponibles en su catálogo'
          }
        </p>
        {selectedCategory && (
          <button
            onClick={() => handleCategoryChange('')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Ver todos los productos
          </button>
        )}
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          if (selectionMode) {
            // Use enhanced selection card
            return (
              <ProductSelectionCard
                key={product.id}
                product={product}
                isSelected={isSelected(product.id)}
                selectedProduct={getSelectedProduct(product.id)}
                onAddToSelection={handleAddToSelection}
                onRemoveFromSelection={handleRemoveFromSelection}
                onUpdateQuantity={handleUpdateQuantity}
              />
            );
          }

          // Use original product card for single product WhatsApp
          const currentImageIndex = currentImageIndexes[product.id] || 0;
          const currentImage = product.images?.[currentImageIndex];
          const hasMultipleImages = product.images && product.images.length > 1;
          const selectedVariantId = selectedVariants[product.id];
          const selectedVariant = selectedVariantId ? product.variants?.find(v => v.id === selectedVariantId) : null;

          return (
            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div 
                className="aspect-square bg-gray-100 relative select-none"
                onTouchStart={(e) => handleTouchStart(e, product.id)}
                onTouchMove={handleTouchMove}
                onTouchEnd={() => handleTouchEnd(product.id, product.images?.length || 1)}
              >
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
                      draggable={false}
                    />
                    
                    {/* Enhanced Image Navigation */}
                    {hasMultipleImages && (
                      <>
                        <button
                          onClick={() => prevImage(product.id, product.images!.length)}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all touch-manipulation"
                          aria-label="Imagen anterior"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => nextImage(product.id, product.images!.length)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all touch-manipulation"
                          aria-label="Imagen siguiente"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                        
                        {/* Enhanced Image Indicators */}
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                          {product.images?.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndexes(prev => ({ ...prev, [product.id]: index }))}
                              className={`w-2 h-2 rounded-full transition-all touch-manipulation ${
                                index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                              }`}
                              aria-label={`Ver imagen ${index + 1}`}
                            />
                          ))}
                        </div>

                        {/* Swipe indicator for mobile */}
                        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full sm:hidden">
                          Desliza
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1" title={product.name}>
                      {product.name}
                    </h3>
                    {product.category && (
                      <div className="flex items-center space-x-1 text-xs text-gray-500 mb-1">
                        <Tag className="h-3 w-3" />
                        <span>{product.category}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <p className="text-2xl font-bold text-blue-600 mb-2">{getProductPrice(product)}</p>
                
                {/* Enhanced Variant Selection with out-of-stock handling */}
                {product.variants && product.variants.length > 0 && (
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Opciones:
                    </label>
                    <select
                      value={selectedVariantId || ''}
                      onChange={(e) => handleVariantChange(product.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="">Producto base</option>
                      {product.variants
                        .filter(variant => variant.isAvailable && variant.stockQuantity > 0)
                        .map((variant) => (
                        <option key={variant.id} value={variant.id}>
                          {variant.name} {variant.priceModifier !== 0 && `(${variant.priceModifier > 0 ? '+' : ''}$${variant.priceModifier.toLocaleString()})`}
                        </option>
                      ))}
                    </select>
                    {selectedVariant && (
                      <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                        <Package className="h-3 w-3" />
                        <span>Stock: {selectedVariant.stockQuantity}</span>
                      </div>
                    )}
                  </div>
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
                  aria-label={`Contactar por WhatsApp sobre ${product.name}${selectedVariant ? ` - ${selectedVariant.name}` : ''}`}
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Pedir por WhatsApp</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </main>

  {/* Floating Action Button - only show in selection mode */}
  {selectionMode && (
    <FloatingActionButton
      totalCount={totalCount}
      totalItems={totalItems}
      onClick={() => setShowSelectionSummary(true)}
    />
  )}

  {/* Selection Summary Modal */}
  <SelectionSummary
    isOpen={showSelectionSummary}
    onClose={() => setShowSelectionSummary(false)}
    selectedProducts={selectedProducts}
    totalCount={totalCount}
    totalItems={totalItems}
    onRemoveProduct={handleRemoveFromSelection}
    onUpdateQuantity={handleUpdateQuantity}
    onClearSelection={clearSelection}
    onSendWhatsApp={handleSendWhatsApp}
    whatsAppUrl={whatsAppUrl}
    storeName={storeOwner?.storeName || ''}
  />

  {/* About Us Modal */}
  <AboutUsModal 
    isOpen={showAboutModal}
    onClose={() => setShowAboutModal(false)}
  />

  {/* Floating About Us Trigger */}
  <AboutUsTrigger 
    onClick={() => setShowAboutModal(true)}
    variant="floating"
  />

  {/* Enhanced Footer */}
  <footer className="bg-white border-t border-gray-200 mt-12">
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Brand */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Store className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-gray-900">Tu Tiendita Digital</span>
          </div>
          <p className="text-sm text-gray-600">
            Democratizando el comercio digital para emprendedores latinoamericanos.
          </p>
        </div>

        {/* Legal Links */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Legal</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <a 
                href="/privacidad" 
                className="hover:text-blue-600 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Política de Privacidad
              </a>
            </li>
            <li>
              <a 
                href="/terminos" 
                className="hover:text-blue-600 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Términos de Servicio
              </a>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Contacto</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>contacto@roffstudio.com</li>
            <li>roberto.vt@roffstudio.com</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-200 mt-6 pt-6 text-center">
        <p className="text-sm text-gray-500">
          © 2025 Tu Tiendita Digital. Hecho con ❤️ para emprendedores. By{' '}
          <a 
            href="https://www.roffstudio.com/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 hover:text-blue-700 transition-colors"
          >
            ROFF Studio
          </a>.
        </p>
      </div>
    </div>
  </footer>
</div>
);
};

export default PublicCatalog;